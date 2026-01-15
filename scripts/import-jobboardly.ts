/**
 * Jobboardly XML Feed Import Script
 *
 * Fetches jobs from https://yemeicmeisi.jobboardly.com/jobs.xml
 * and imports them into the external_jobs table.
 *
 * Usage:
 *   npx tsx scripts/import-jobboardly.ts
 *
 * Options:
 *   --dry-run    Preview without inserting
 *   --limit=N    Limit to N jobs
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// XML Feed URL
const FEED_URL = 'https://yemeicmeisi.jobboardly.com/jobs.xml';

// Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse command line args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

interface JobXML {
  guid: string;
  title: string;
  company_name: string;
  location: string;
  url: string;
  application_link: string;
  html_description: string;
  plain_text_description: string;
  published_at: string;
  expires_at: string;
  arrangement: string;
  location_type: string;
  salary_minimum: string;
  salary_maximum: string;
  salary_currency: string;
}

/**
 * Extract text content from XML element
 */
function getTextContent(element: Element, tagName: string): string {
  const el = element.getElementsByTagName(tagName)[0];
  return el?.textContent?.trim() || '';
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    // Fix double https:// issue in some feeds
    let cleanUrl = url;
    if (url.startsWith('https://https://')) {
      cleanUrl = url.replace('https://https://', 'https://');
    } else if (url.startsWith('http://http://')) {
      cleanUrl = url.replace('http://http://', 'http://');
    }

    const urlObj = new URL(cleanUrl);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

/**
 * Clean URL (fix double protocol issue)
 */
function cleanUrl(url: string): string {
  if (url.startsWith('https://https://')) {
    return url.replace('https://https://', 'https://');
  }
  if (url.startsWith('http://http://')) {
    return url.replace('http://http://', 'http://');
  }
  return url;
}

/**
 * Parse location string to extract city
 * Format: "City, Region, Country" or "City, Country"
 */
function parseLocation(location: string): { city: string | null; country: string | null } {
  if (!location) return { city: null, country: null };

  const parts = location.split(',').map((p) => p.trim());

  if (parts.length >= 1) {
    return {
      city: parts[0] || null,
      country: parts[parts.length - 1] || null,
    };
  }

  return { city: null, country: null };
}

/**
 * Fetch and parse XML feed
 */
async function fetchJobsFeed(): Promise<JobXML[]> {
  console.log(`Fetching XML feed from ${FEED_URL}...`);

  const response = await fetch(FEED_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  const xmlText = await response.text();
  console.log(`Received ${xmlText.length} bytes`);

  // Parse XML using DOMParser (available in Node 18+)
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const jobElements = doc.getElementsByTagName('job');
  const jobs: JobXML[] = [];

  console.log(`Found ${jobElements.length} jobs in feed`);

  for (let i = 0; i < jobElements.length; i++) {
    const job = jobElements[i];

    jobs.push({
      guid: getTextContent(job, 'guid'),
      title: getTextContent(job, 'title'),
      company_name: getTextContent(job, 'company_name'),
      location: getTextContent(job, 'location'),
      url: getTextContent(job, 'url'),
      application_link: getTextContent(job, 'application_link'),
      html_description: getTextContent(job, 'html_description'),
      plain_text_description: getTextContent(job, 'plain_text_description'),
      published_at: getTextContent(job, 'published_at'),
      expires_at: getTextContent(job, 'expires_at'),
      arrangement: getTextContent(job, 'arrangement'),
      location_type: getTextContent(job, 'location_type'),
      salary_minimum: getTextContent(job, 'salary_minimum'),
      salary_maximum: getTextContent(job, 'salary_maximum'),
      salary_currency: getTextContent(job, 'salary_currency'),
    });
  }

  return jobs;
}

/**
 * Convert XML job to database format
 */
function convertToDbFormat(job: JobXML) {
  // Use application_link if available, otherwise url
  const rawUrl = job.application_link || job.url;
  const sourceUrl = cleanUrl(rawUrl);
  const sourceDomain = extractDomain(sourceUrl);
  const { city } = parseLocation(job.location);

  // Truncate description if too long
  const description = job.plain_text_description?.substring(0, 2000) || null;

  return {
    title: job.title,
    company_name: job.company_name,
    location_city: city,
    location_district: null,
    description,
    source_domain: sourceDomain,
    source_url: sourceUrl,
    position_type: null,
    venue_type: null,
    utm_source: 'yemeicmeisi',
    utm_medium: 'referral',
    utm_campaign: 'jobboardly-feed',
    is_active: true,
    expires_at: job.expires_at ? new Date(job.expires_at).toISOString() : null,
  };
}

/**
 * Main import function
 */
async function importJobs() {
  console.log('\n=== Jobboardly XML Feed Import ===\n');

  if (isDryRun) {
    console.log('DRY RUN MODE - No data will be inserted\n');
  }

  try {
    // Fetch jobs from XML feed
    let jobs = await fetchJobsFeed();

    // Apply limit if specified
    if (limit && limit > 0) {
      console.log(`Limiting to ${limit} jobs`);
      jobs = jobs.slice(0, limit);
    }

    console.log(`\nProcessing ${jobs.length} jobs...\n`);

    // Get existing jobs to avoid duplicates (by source_url)
    const { data: existingJobs } = await supabase
      .from('external_jobs')
      .select('source_url');

    const existingUrls = new Set(existingJobs?.map((j) => j.source_url) || []);

    // Convert and filter jobs
    const newJobs = jobs
      .map(convertToDbFormat)
      .filter((job) => !existingUrls.has(job.source_url));

    console.log(`Found ${newJobs.length} new jobs (${jobs.length - newJobs.length} already exist)`);

    if (newJobs.length === 0) {
      console.log('\nNo new jobs to import.');
      return;
    }

    // Preview first few jobs
    console.log('\nSample jobs:');
    newJobs.slice(0, 3).forEach((job, i) => {
      console.log(`  ${i + 1}. ${job.title} @ ${job.company_name}`);
      console.log(`     Location: ${job.location_city || 'N/A'}`);
      console.log(`     Source: ${job.source_domain}`);
      console.log(`     URL: ${job.source_url.substring(0, 60)}...`);
      console.log('');
    });

    if (isDryRun) {
      console.log(`\nDRY RUN: Would insert ${newJobs.length} jobs`);
      return;
    }

    // Insert jobs in batches
    const BATCH_SIZE = 50;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < newJobs.length; i += BATCH_SIZE) {
      const batch = newJobs.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase.from('external_jobs').insert(batch).select('id');

      if (error) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
        errors += batch.length;
      } else {
        inserted += data?.length || 0;
        console.log(`Inserted batch ${i / BATCH_SIZE + 1}: ${data?.length || 0} jobs`);
      }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`Inserted: ${inserted} jobs`);
    console.log(`Errors: ${errors}`);
    console.log(`Skipped (duplicates): ${jobs.length - newJobs.length}`);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run import
importJobs();
