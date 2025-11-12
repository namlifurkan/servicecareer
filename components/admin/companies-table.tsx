'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Check,
  X,
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  logo_url: string | null
  industry: string | null
  phone: string | null
  email: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
  } | null
  cities: {
    id: string
    name: string
  } | null
}

interface CompaniesTableProps {
  companies: Company[]
}

export function CompaniesTable({ companies: initialCompanies }: CompaniesTableProps) {
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'verified' | 'unverified'>('all')
  const [loading, setLoading] = useState<string | null>(null)

  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && company.is_active) ||
      (statusFilter === 'inactive' && !company.is_active) ||
      (statusFilter === 'verified' && company.is_verified) ||
      (statusFilter === 'unverified' && !company.is_verified)

    return matchesSearch && matchesStatus
  })

  const handleVerify = async (companyId: string, verify: boolean) => {
    setLoading(companyId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_verified: verify })
        .eq('id', companyId)

      if (error) throw error

      setCompanies(companies.map(c =>
        c.id === companyId ? { ...c, is_verified: verify } : c
      ))

      toast.success(verify ? 'Şirket onaylandı' : 'Şirket onayı kaldırıldı')
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setLoading(null)
    }
  }

  const handleToggleActive = async (companyId: string, active: boolean) => {
    setLoading(companyId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: active })
        .eq('id', companyId)

      if (error) throw error

      setCompanies(companies.map(c =>
        c.id === companyId ? { ...c, is_active: active } : c
      ))

      toast.success(active ? 'Şirket aktifleştirildi' : 'Şirket pasifleştirildi')
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setLoading(null)
    }
  }

  const stats = {
    total: companies.length,
    verified: companies.filter(c => c.is_verified).length,
    unverified: companies.filter(c => !c.is_verified).length,
    active: companies.filter(c => c.is_active).length,
    inactive: companies.filter(c => !c.is_active).length
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-secondary-900">{stats.total}</div>
          <div className="text-sm text-secondary-600">Toplam Şirket</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-green-600">{stats.verified}</div>
          <div className="text-sm text-secondary-600">Onaylı</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-yellow-600">{stats.unverified}</div>
          <div className="text-sm text-secondary-600">Onay Bekliyor</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-primary-600">{stats.active}</div>
          <div className="text-sm text-secondary-600">Aktif</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-secondary-400">{stats.inactive}</div>
          <div className="text-sm text-secondary-600">Pasif</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Şirket adı, email ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="verified">Onaylı</option>
            <option value="unverified">Onaysız</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Şirket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Sahip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">
                    Şirket bulunamadı
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-secondary-50">
                    {/* Company Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-secondary-900 truncate">
                            {company.name}
                          </div>
                          <div className="text-sm text-secondary-600 flex items-center gap-2">
                            {company.cities && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.cities.name}
                              </span>
                            )}
                            {company.industry && (
                              <span className="text-secondary-400">• {company.industry}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {company.email && (
                          <div className="flex items-center gap-1.5 text-sm text-secondary-600">
                            <Mail className="h-3 w-3" />
                            {company.email}
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-secondary-600">
                            <Phone className="h-3 w-3" />
                            {company.phone}
                          </div>
                        )}
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-secondary-900">
                          {company.profiles?.full_name || 'İsimsiz'}
                        </div>
                        <div className="text-secondary-600">{company.profiles?.email}</div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {company.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Onaylı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                            <Clock className="h-3 w-3" />
                            Onay Bekliyor
                          </span>
                        )}
                        <br />
                        {company.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                            <XCircle className="h-3 w-3" />
                            Pasif
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-secondary-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(company.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!company.is_verified && (
                          <button
                            onClick={() => handleVerify(company.id, true)}
                            disabled={loading === company.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Onayla"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {company.is_verified && (
                          <button
                            onClick={() => handleVerify(company.id, false)}
                            disabled={loading === company.id}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Onayı Kaldır"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(company.id, !company.is_active)}
                          disabled={loading === company.id}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            company.is_active
                              ? 'text-accent-600 hover:bg-accent-50'
                              : 'text-primary-600 hover:bg-primary-50'
                          }`}
                          title={company.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                        >
                          {company.is_active ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-secondary-600 text-center">
        {filteredCompanies.length} şirket görüntüleniyor
        {filteredCompanies.length !== companies.length && ` (${companies.length} toplam)`}
      </div>
    </div>
  )
}
