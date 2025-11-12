'use client'

import { useState } from 'react'
import { Search, MoreVertical, Check, X } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  created_at: string
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = !roleFilter || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div>
      {/* Filters */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Email veya isim ile ara..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tüm Roller</option>
            <option value="company">İşveren</option>
            <option value="candidate">Aday</option>
            <option value="admin">Yönetici</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-secondary-600">
          {filteredUsers.length} kullanıcı bulundu
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Kayıt Tarihi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary-600">
                        {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {user.full_name || 'İsimsiz'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-accent-50 text-accent-700' :
                    user.role === 'company' ? 'bg-primary-50 text-primary-700' :
                    'bg-secondary-100 text-secondary-700'
                  }`}>
                    {user.role === 'company' ? 'İşveren' :
                     user.role === 'candidate' ? 'Aday' :
                     user.role === 'admin' ? 'Yönetici' : user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_active ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-accent-600">
                      <X className="h-4 w-4" />
                      Pasif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-secondary-400 hover:text-secondary-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-500">Kullanıcı bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  )
}
