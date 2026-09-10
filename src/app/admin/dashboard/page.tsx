'use client'

import * as React from 'react'
import { useSession, signOut, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
  Camera,
  LayoutDashboard,
  Images,
  Layers,
  CalendarCheck,
  CreditCard,
  Clock,
  Settings,
  Wifi,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Search,
  ExternalLink,
  Moon,
  Sun,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  Phone,
  Mail,
  Save,
  DollarSign,
  User,
  Lock,
  RotateCcw,
  Calendar,
  ArrowUpDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatBsDateTime, formatBsDate } from '@/lib/nepali-date'
import type { PackagePriceData } from '@/lib/packages-data'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { NetworkAccessCard } from '@/components/site/network-access-card'
import { GALLERY_CATEGORY_LABELS, GALLERY_SUBCATEGORY_LABELS } from '@/lib/site'

type TabType =
  | 'overview'
  | 'gallery'
  | 'services'
  | 'bookings'
  | 'messages'
  | 'payments'
  | 'contact-hours'
  | 'site-content'

interface ContactMessageItem {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

interface GalleryPhotoItem {
  id: string
  src: string
  title: string
  category: string
  subcategory?: string | null
  description?: string | null
  order: number
}

interface ServiceItem {
  id: string
  key: string
  title: string
  description: string
  priceFrom: number
  priceLabel: string
  icon: string
  order: number
}

interface BookingItem {
  id: string
  name: string
  email: string
  phone: string
  service: string
  date: string
  message?: string | null
  status: string
  createdAt: string
}

interface PaymentItem {
  id: string
  gateway: string
  customerName: string
  customerPhone: string
  packageName: string
  amount: number
  transactionUuid: string
  pidx?: string | null
  status: string
  createdAt: string
}

interface StudioHourItem {
  id?: string
  day: string
  time: string
  order?: number
}

interface SocialLinkItem {
  id?: string
  label: string
  icon: string
  href: string
  order?: number
}

const DRAFT_STORAGE_KEY = 'wedding_moment_admin_photo_draft'

/**
 * Format ISO timestamp into Bikram Sambat (BS) format: "2083 Bhadra 21 · 3:45 PM"
 */
function formatTimestamp(isoString?: string | null): string {
  if (!isoString) return '—'
  return formatBsDateTime(isoString)
}

/**
 * Format photoshoot event date (stored in AD) into Bikram Sambat (BS): "2083 Bhadra 21"
 */
function formatEventDate(dateString?: string | null): string {
  if (!dateString) return '—'
  return formatBsDate(dateString)
}

interface GalleryPhotoCardProps {
  photo: GalleryPhotoItem
  onEdit: (photo: GalleryPhotoItem) => void
  onDelete: (photo: GalleryPhotoItem) => void
  priority?: boolean
}

/**
 * Highly optimized, memoized photo card component.
 * Prevents re-rendering all photo cards on unrelated dashboard state changes,
 * uses hardware-accelerated transforms, responsive next/image sizing,
 * and lightweight optimized WebP thumbnails to ensure butter-smooth 60/120fps scrolling.
 */
const GalleryPhotoCard = React.memo(function GalleryPhotoCard({
  photo,
  onEdit,
  onDelete,
  priority = false,
}: GalleryPhotoCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden group shadow-sm flex flex-col justify-between transform-gpu transition-all hover:border-gold/40 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        <Image
          src={photo.src}
          alt={photo.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={75}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-300 transform-gpu will-change-transform"
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-black/70 text-gold text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm">
            {GALLERY_CATEGORY_LABELS[photo.category] || photo.category}
          </span>
          {photo.subcategory && (
            <span className="px-2 py-0.5 rounded-md bg-gold text-black text-[10px] uppercase font-bold tracking-wider shadow-sm">
              {GALLERY_SUBCATEGORY_LABELS[photo.subcategory] || photo.subcategory}
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-bold text-sm truncate text-foreground" title={photo.title}>
            {photo.title}
          </h3>
          {photo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {photo.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-border/60">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(photo)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(photo)}
            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
})

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  const [activeTab, setActiveTab] = React.useState<TabType>('overview')
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [loadingData, setLoadingData] = React.useState(true)

  // Data states
  const [gallery, setGallery] = React.useState<GalleryPhotoItem[]>([])
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [bookings, setBookings] = React.useState<BookingItem[]>([])
  const [payments, setPayments] = React.useState<PaymentItem[]>([])
  const [messages, setMessages] = React.useState<ContactMessageItem[]>([])
  const [siteSettings, setSiteSettings] = React.useState<Record<string, string>>({})
  const [studioHours, setStudioHours] = React.useState<StudioHourItem[]>([])
  const [socialLinks, setSocialLinks] = React.useState<SocialLinkItem[]>([])
  const [packages, setPackages] = React.useState<PackagePriceData[]>([])
  const [editedPrices, setEditedPrices] = React.useState<Record<string, number | string>>({})
  const [editedPriceTypes, setEditedPriceTypes] = React.useState<Record<string, 'fixed' | 'advance'>>({})
  const [savingPackageKey, setSavingPackageKey] = React.useState<string | null>(null)
  const [packageCategoryTab, setPackageCategoryTab] = React.useState<'all' | 'indoor' | 'wedding'>('all')

  // Modal states
  const [galleryModalOpen, setGalleryModalOpen] = React.useState(false)
  const [editingPhoto, setEditingPhoto] = React.useState<GalleryPhotoItem | null>(null)
  const [photoForm, setPhotoForm] = React.useState({
    title: '',
    category: 'wedding',
    subcategory: '',
    description: '',
    src: '',
  })
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Quick In-Place Login (session expired recovery)
  const [quickLoginOpen, setQuickLoginOpen] = React.useState(false)
  const [quickLoginEmail, setQuickLoginEmail] = React.useState('')
  const [quickLoginPassword, setQuickLoginPassword] = React.useState('')
  const [quickLoginLoading, setQuickLoginLoading] = React.useState(false)

  const [serviceModalOpen, setServiceModalOpen] = React.useState(false)
  const [editingService, setEditingService] = React.useState<ServiceItem | null>(null)
  const [serviceForm, setServiceForm] = React.useState({
    title: '',
    key: '',
    description: '',
    priceFrom: 2999,
    priceLabel: 'रु 2,999+',
    icon: 'camera',
  })

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [deleteAction, setDeleteAction] = React.useState<{
    type: 'gallery' | 'service' | 'booking' | 'payment' | 'message'
    id: string
    title: string
  } | null>(null)

  // Filters & Sorting
  const [galleryFilter, setGalleryFilter] = React.useState('all')
  const [gallerySearch, setGallerySearch] = React.useState('')
  const [galleryPage, setGalleryPage] = React.useState<number>(1)
  const [galleryPageSize, setGalleryPageSize] = React.useState<number>(16)
  const [bookingFilter, setBookingFilter] = React.useState('all')
  const [bookingSearch, setBookingSearch] = React.useState('')
  const [bookingSort, setBookingSort] = React.useState<
    'created-desc' | 'created-asc' | 'date-asc' | 'date-desc'
  >('created-desc')
  const [paymentFilter, setPaymentFilter] = React.useState('all')
  const [paymentSort, setPaymentSort] = React.useState<
    'created-desc' | 'created-asc' | 'amount-desc' | 'amount-asc'
  >('created-desc')
  const [messageSearch, setMessageSearch] = React.useState('')
  const [messageSort, setMessageSort] = React.useState<
    'created-desc' | 'created-asc'
  >('created-desc')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-save photo draft to localStorage
  React.useEffect(() => {
    if (!editingPhoto && galleryModalOpen) {
      if (photoForm.title || photoForm.description || photoForm.src) {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(photoForm))
        } catch {}
      }
    }
  }, [photoForm, editingPhoto, galleryModalOpen])

  // Check auth session
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Helper for authenticated fetch with 401 handling
  const authFetch = React.useCallback(
    async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, {
        ...options,
        credentials: 'include',
      })

      if (res.status === 401) {
        setQuickLoginEmail(session?.user?.email || 'weddingmomentpkr@gmail.com')
        setQuickLoginOpen(true)
        toast.error('Session expired. Please log in below to continue without losing your work.')
      }

      return res
    },
    [session]
  )

  // Load initial data
  const loadAllData = React.useCallback(async () => {
    setLoadingData(true)
    try {
      const [gRes, sRes, bRes, pRes, setRes, mRes, pkgRes] = await Promise.all([
        authFetch('/api/admin/gallery'),
        authFetch('/api/admin/services'),
        authFetch('/api/admin/bookings'),
        authFetch('/api/admin/payments'),
        authFetch('/api/admin/settings'),
        authFetch('/api/admin/messages'),
        authFetch('/api/admin/packages'),
      ])

      if (gRes.ok) setGallery(await gRes.json())
      if (sRes.ok) setServices(await sRes.json())
      if (bRes.ok) setBookings(await bRes.json())
      if (pRes.ok) setPayments(await pRes.json())
      if (mRes.ok) setMessages(await mRes.json())
      if (pkgRes.ok) {
        const pkgs: PackagePriceData[] = await pkgRes.json()
        setPackages(pkgs)
        const pricesMap: Record<string, number | string> = {}
        const typesMap: Record<string, 'fixed' | 'advance'> = {}
        for (const p of pkgs) {
          pricesMap[p.packageKey] = p.amount
          typesMap[p.packageKey] = p.priceType === 'fixed' ? 'fixed' : 'advance'
        }
        setEditedPrices(pricesMap)
        setEditedPriceTypes(typesMap)
      }
      if (setRes.ok) {
        const data = await setRes.json()
        setSiteSettings(data.settings || {})
        setStudioHours(data.hours || [])
        setSocialLinks(data.socialLinks || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoadingData(false)
    }
  }, [authFetch])

  React.useEffect(() => {
    if (status === 'authenticated') {
      loadAllData()
    }
  }, [status, loadAllData])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying Admin Credentials...
        </p>
      </div>
    )
  }

  // ----------------------------------------------------
  // Quick In-Place Login Handler
  // ----------------------------------------------------
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setQuickLoginLoading(true)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: quickLoginEmail.trim().toLowerCase(),
        password: quickLoginPassword,
      })

      if (res?.error) {
        toast.error('Invalid credentials. Please try again.')
      } else {
        toast.success('Session refreshed! You may continue your action.')
        setQuickLoginOpen(false)
        setQuickLoginPassword('')
        loadAllData()
      }
    } catch {
      toast.error('Login error')
    } finally {
      setQuickLoginLoading(false)
    }
  }

  // ----------------------------------------------------
  // Gallery Handlers
  // ----------------------------------------------------
  const handleOpenAddPhoto = () => {
    setEditingPhoto(null)

    // Check for saved draft
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        if (parsed.title || parsed.description || parsed.src) {
          setPhotoForm(parsed)
          toast.info('Restored unsaved photo draft', {
            action: {
              label: 'Clear Draft',
              onClick: () => {
                localStorage.removeItem(DRAFT_STORAGE_KEY)
                setPhotoForm({ title: '', category: 'wedding', subcategory: '', description: '', src: '' })
              },
            },
          })
          setGalleryModalOpen(true)
          return
        }
      }
    } catch {}

    setPhotoForm({
      title: '',
      category: 'wedding',
      subcategory: '',
      description: '',
      src: '',
    })
    setGalleryModalOpen(true)
  }

  const handleOpenEditPhoto = (photo: GalleryPhotoItem) => {
    setEditingPhoto(photo)
    setPhotoForm({
      title: photo.title,
      category: photo.category,
      subcategory: photo.subcategory || '',
      description: photo.description || '',
      src: photo.src,
    })
    setGalleryModalOpen(true)
  }

  const handleFileUpload = async (file: File) => {
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.url) {
        setPhotoForm((prev) => ({ ...prev, src: data.url }))
        toast.success('Image uploaded successfully!')
      } else {
        toast.error(data.error || 'Failed to upload image')
      }
    } catch {
      toast.error('Network error during upload')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photoForm.src || !photoForm.title || !photoForm.category) {
      toast.error('Please provide an image, title, and category')
      return
    }

    try {
      if (editingPhoto) {
        const res = await authFetch('/api/admin/gallery', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPhoto.id,
            ...photoForm,
          }),
        })
        if (res.ok) {
          const updated = await res.json()
          setGallery((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          )
          toast.success('Photo updated successfully!')
          setGalleryModalOpen(false)
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to update photo')
        }
      } else {
        const res = await authFetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photoForm),
        })
        if (res.ok) {
          const created = await res.json()
          setGallery((prev) => [...prev, created])
          toast.success('Photo added to gallery!')
          try {
            localStorage.removeItem(DRAFT_STORAGE_KEY)
          } catch {}
          setGalleryModalOpen(false)
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to create photo')
        }
      }
    } catch {
      toast.error('An error occurred while saving photo')
    }
  }

  // ----------------------------------------------------
  // Service Handlers
  // ----------------------------------------------------
  const handleOpenAddService = () => {
    setEditingService(null)
    setServiceForm({
      title: '',
      key: '',
      description: '',
      priceFrom: 2999,
      priceLabel: 'रु 2,999+',
      icon: 'camera',
    })
    setServiceModalOpen(true)
  }

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service)
    setServiceForm({
      title: service.title,
      key: service.key,
      description: service.description,
      priceFrom: service.priceFrom,
      priceLabel: service.priceLabel,
      icon: service.icon,
    })
    setServiceModalOpen(true)
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceForm.title || !serviceForm.description) {
      toast.error('Title and description are required')
      return
    }

    try {
      if (editingService) {
        const res = await authFetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingService.id,
            ...serviceForm,
          }),
        })
        if (res.ok) {
          const updated = await res.json()
          setServices((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          )
          toast.success('Service updated!')
          setServiceModalOpen(false)
        } else {
          toast.error('Failed to update service')
        }
      } else {
        const res = await authFetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceForm),
        })
        if (res.ok) {
          const created = await res.json()
          setServices((prev) => [...prev, created])
          toast.success('Service created!')
          setServiceModalOpen(false)
        } else {
          toast.error('Failed to create service')
        }
      }
    } catch {
      toast.error('Error saving service')
    }
  }

  // ----------------------------------------------------
  // Package Price Update Handler
  // ----------------------------------------------------
  const handleSavePackagePrice = async (packageKey: string) => {
    const rawVal = editedPrices[packageKey]
    const amountVal = Number(rawVal)
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid positive numeric price.')
      return
    }

    const priceType = editedPriceTypes[packageKey] || 'advance'

    setSavingPackageKey(packageKey)
    try {
      const res = await authFetch('/api/admin/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageKey, amount: amountVal, priceType }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update package price')
      }

      const updated: PackagePriceData = await res.json()
      setPackages((prev) =>
        prev.map((p) => (p.packageKey === packageKey ? updated : p))
      )
      setEditedPrices((prev) => ({ ...prev, [packageKey]: updated.amount }))
      setEditedPriceTypes((prev) => ({
        ...prev,
        [packageKey]: updated.priceType === 'fixed' ? 'fixed' : 'advance',
      }))
      const typeLabel = updated.priceType === 'fixed' ? 'Fixed Price' : 'Advance Price'
      toast.success(`Updated: ${updated.name} → NPR ${amountVal.toLocaleString()} (${typeLabel})`)
    } catch (err: any) {
      toast.error(err.message || 'Error updating price')
    } finally {
      setSavingPackageKey(null)
    }
  }

  // ----------------------------------------------------
  // Booking Status Handler
  // ----------------------------------------------------
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await authFetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        )
        toast.success(`Booking marked as ${newStatus}`)
      } else {
        toast.error('Failed to update booking status')
      }
    } catch {
      toast.error('Error updating status')
    }
  }

  // ----------------------------------------------------
  // Payment Status Handler
  // ----------------------------------------------------
  const handleUpdatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      const res = await authFetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        )
        toast.success(`Payment status updated to ${newStatus}`)
      } else {
        toast.error('Failed to update payment status')
      }
    } catch {
      toast.error('Error updating payment')
    }
  }

  // ----------------------------------------------------
  // Generic Delete Confirmation Execution
  // ----------------------------------------------------
  const handleConfirmDelete = async () => {
    if (!deleteAction) return

    try {
      if (deleteAction.type === 'gallery') {
        const res = await authFetch(`/api/admin/gallery?id=${deleteAction.id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setGallery((prev) => prev.filter((p) => p.id !== deleteAction.id))
          toast.success('Photo deleted from gallery')
        }
      } else if (deleteAction.type === 'service') {
        const res = await authFetch(`/api/admin/services?id=${deleteAction.id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setServices((prev) => prev.filter((s) => s.id !== deleteAction.id))
          toast.success('Service deleted')
        }
      } else if (deleteAction.type === 'booking') {
        const res = await authFetch(`/api/admin/bookings?id=${deleteAction.id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setBookings((prev) => prev.filter((b) => b.id !== deleteAction.id))
          toast.success('Booking deleted')
        }
      } else if (deleteAction.type === 'payment') {
        const res = await authFetch(`/api/admin/payments?id=${deleteAction.id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setPayments((prev) => prev.filter((p) => p.id !== deleteAction.id))
          toast.success('Payment record deleted')
        }
      } else if (deleteAction.type === 'message') {
        const res = await authFetch(`/api/admin/messages?id=${deleteAction.id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== deleteAction.id))
          toast.success('Message deleted')
        }
      }
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setDeleteConfirmOpen(false)
      setDeleteAction(null)
    }
  }

  // ----------------------------------------------------
  // Settings & Hours Save Handlers
  // ----------------------------------------------------
  const handleSaveSettingsAndHours = async (type: 'hours' | 'content') => {
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: siteSettings,
          hours: studioHours,
          socialLinks,
        }),
      })
      if (res.ok) {
        toast.success(
          type === 'hours'
            ? 'Studio hours & contact info saved!'
            : 'Website & footer content updated!'
        )
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Error saving settings')
    }
  }

  const handleAddHourRow = () => {
    setStudioHours((prev) => [...prev, { day: 'New Day', time: '10:00 AM to 6:00 PM' }])
  }

  const handleRemoveHourRow = (index: number) => {
    setStudioHours((prev) => prev.filter((_, i) => i !== index))
  }

  const handleHourChange = (index: number, field: 'day' | 'time', val: string) => {
    setStudioHours((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    )
  }

  // Filtered lists (memoized to prevent heavy recalculations on unrelated dashboard state updates)
  const filteredGallery = React.useMemo(() => {
    const query = gallerySearch.toLowerCase().trim()
    return gallery.filter((p) => {
      const matchCategory = galleryFilter === 'all' ? true : p.category === galleryFilter
      if (!query) return matchCategory
      const matchSearch =
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query))
      return matchCategory && matchSearch
    })
  }, [gallery, galleryFilter, gallerySearch])

  const totalGalleryPages = Math.max(
    1,
    galleryPageSize === -1 ? 1 : Math.ceil(filteredGallery.length / galleryPageSize)
  )

  // Auto-clamp gallery page when filter or search changes
  React.useEffect(() => {
    if (galleryPage > totalGalleryPages) {
      setGalleryPage(totalGalleryPages)
    }
  }, [galleryPage, totalGalleryPages])

  const displayedGallery = React.useMemo(() => {
    if (galleryPageSize === -1) return filteredGallery
    const start = (galleryPage - 1) * galleryPageSize
    return filteredGallery.slice(start, start + galleryPageSize)
  }, [filteredGallery, galleryPage, galleryPageSize])

  const handlePhotoCardEdit = React.useCallback((photo: GalleryPhotoItem) => {
    handleOpenEditPhoto(photo)
  }, [])

  const handlePhotoCardDelete = React.useCallback((photo: GalleryPhotoItem) => {
    setDeleteAction({
      type: 'gallery',
      id: photo.id,
      title: photo.title,
    })
    setDeleteConfirmOpen(true)
  }, [])

  const filteredBookings = bookings
    .filter((b) => {
      const matchStatus = bookingFilter === 'all' || b.status === bookingFilter
      const matchSearch =
        bookingSearch === '' ||
        b.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.phone.includes(bookingSearch) ||
        b.service.toLowerCase().includes(bookingSearch.toLowerCase())
      return matchStatus && matchSearch
    })
    .sort((a, b) => {
      if (bookingSort === 'created-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (bookingSort === 'date-asc') {
        return (a.date || '').localeCompare(b.date || '')
      }
      if (bookingSort === 'date-desc') {
        return (b.date || '').localeCompare(a.date || '')
      }
      // default: created-desc (newest booked on first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const filteredPayments = payments
    .filter((p) =>
      paymentFilter === 'all' ? true : p.gateway === paymentFilter || p.status === paymentFilter
    )
    .sort((a, b) => {
      if (paymentSort === 'created-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (paymentSort === 'amount-desc') {
        return (b.amount || 0) - (a.amount || 0)
      }
      if (paymentSort === 'amount-asc') {
        return (a.amount || 0) - (b.amount || 0)
      }
      // default: created-desc (newest paid on first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const filteredMessages = messages
    .filter((m) => {
      if (!messageSearch) return true
      const q = messageSearch.toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (messageSort === 'created-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      // default: created-desc (newest received first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Quick stats
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length
  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* ----------------- SIDEBAR (DESKTOP) ----------------- */}
      <aside className="hidden lg:flex w-72 flex-col justify-between bg-card border-r border-border p-6 shrink-0">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8 group">
            <div className="relative h-10 w-10 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/logo.svg"
                alt="Wedding Moment Logo"
                width={40}
                height={40}
                className="h-9 w-9 object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-foreground leading-tight">
                Wedding<span className="text-gold">Moment</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-medium">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'overview'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'gallery'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Images className="h-4 w-4 shrink-0" />
                Gallery Photos
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">
                {gallery.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'services'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 shrink-0" />
                Services
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">
                {services.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'bookings'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="h-4 w-4 shrink-0" />
                Bookings
              </div>
              {pendingBookingsCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'messages'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0" />
                Direct Messages
              </div>
              {messages.length > 0 && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-bold',
                    activeTab === 'messages'
                      ? 'bg-black text-gold'
                      : 'bg-gold/20 text-gold'
                  )}
                >
                  {messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'payments'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 shrink-0" />
                Payments
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">
                {payments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('contact-hours')}
              className={cn(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'contact-hours'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Clock className="h-4 w-4 shrink-0" />
              Hours &amp; Contact
            </button>

            <button
              onClick={() => setActiveTab('site-content')}
              className={cn(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === 'site-content'
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Site &amp; Footer Text
            </button>
          </nav>
        </div>

        {/* User profile & Actions */}
        <div className="pt-6 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-bold text-sm">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-foreground">
                {session?.user?.name || 'Studio Admin'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs h-8 gap-1.5"
            >
              <Link href="/" target="_blank">
                <ExternalLink className="h-3 w-3" />
                Live Site
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-xs h-8 text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* ----------------- MOBILE HEADER ----------------- */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-full shrink-0 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Wedding Moment Logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="font-serif text-base font-bold">
            Admin <span className="text-gold">Panel</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          )}

          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center"
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-card border-b border-border p-4 space-y-2 animate-in slide-in-from-top-2">
          <nav className="grid grid-cols-2 gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'gallery', label: 'Gallery', icon: Images },
              { id: 'services', label: 'Services', icon: Layers },
              { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
              { id: 'messages', label: `Messages (${messages.length})`, icon: Mail },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'contact-hours', label: 'Hours & Contact', icon: Clock },
              { id: 'site-content', label: 'Site Content', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType)
                    setMobileNavOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left border',
                    activeTab === tab.id
                      ? 'bg-gold text-black border-gold font-bold'
                      : 'border-border text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="pt-2 flex justify-between items-center border-t border-border mt-2">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-gold flex items-center gap-1 font-medium"
            >
              <ExternalLink className="h-3 w-3" /> Live Website
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-xs text-destructive font-medium flex items-center gap-1"
            >
              <LogOut className="h-3 w-3" /> Log Out
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <main className="flex-1 min-w-0 bg-background flex flex-col">
        {/* Top bar (Desktop) */}
        <header className="hidden lg:flex h-16 border-b border-border px-8 items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div>
            <h1 className="font-serif text-lg font-bold capitalize text-foreground">
              {activeTab === 'contact-hours'
                ? 'Studio Hours & Contact Information'
                : activeTab === 'site-content'
                ? 'Homepage & Footer Content'
                : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-gold" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}

            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-9 gap-1.5 text-xs border-border bg-card hover:border-gold/50"
            >
              <Link href="/network" target="_blank" title="View Local Wi-Fi Access details">
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Wi-Fi Access</span>
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={loadAllData}
              disabled={loadingData}
              className="h-9 gap-1.5 text-xs border-border"
            >
              <Loader2 className={cn('h-3.5 w-3.5', loadingData && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {loadingData ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <p className="text-sm text-muted-foreground">Loading studio data...</p>
            </div>
          ) : (
            <>
              {/* ========================================================
                  TAB 1: OVERVIEW
                 ======================================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in-50">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Total Bookings
                        </span>
                        <div className="h-8 w-8 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                          <CalendarCheck className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold font-serif">{bookings.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pendingBookingsCount} pending confirmation
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('messages')}
                      className="bg-card border border-border rounded-2xl p-5 shadow-sm cursor-pointer hover:border-gold/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Direct Notes
                        </span>
                        <div className="h-8 w-8 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                          <Mail className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold font-serif">{messages.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From contact form
                      </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Paid Revenue
                        </span>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-xs tracking-tight">
                          Rs
                        </div>
                      </div>
                      <p className="text-3xl font-bold font-serif">
                        Rs. {totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {payments.length} total transaction logs
                      </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Active Services
                        </span>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                          <Layers className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold font-serif">{services.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Live photography packages
                      </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Gallery Showcase
                        </span>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <Images className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold font-serif">{gallery.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Organized across 4 categories
                      </p>
                    </div>
                  </div>

                  {/* Recent Bookings & Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="font-serif text-lg font-bold">Recent Booking Inquiries</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('bookings')}
                          className="text-xs text-gold hover:text-gold/90"
                        >
                          View All
                        </Button>
                      </div>

                      {bookings.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                          No booking inquiries yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-border">
                          {bookings.slice(0, 5).map((b) => (
                            <div
                              key={b.id}
                              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <p className="font-semibold text-sm text-foreground">
                                  {b.name}
                                </p>
                                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span className="font-medium text-foreground/90">{b.service}</span>
                                  <span>&bull;</span>
                                  <span>{b.phone}</span>
                                  <span>&bull;</span>
                                  <span className="inline-flex items-center gap-1 text-foreground font-medium">
                                    <Calendar className="h-3 w-3 text-gold" />
                                    Reserved: {formatEventDate(b.date)}
                                    <span className="text-[10px] text-muted-foreground font-mono">({b.date})</span>
                                  </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 text-muted-foreground/70" />
                                  <span>Booked On: {formatTimestamp(b.createdAt)}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider',
                                    b.status === 'confirmed' && 'bg-green-500/15 text-green-500',
                                    b.status === 'pending' && 'bg-amber-500/15 text-amber-500',
                                    b.status === 'completed' && 'bg-blue-500/15 text-blue-500',
                                    b.status === 'cancelled' && 'bg-destructive/15 text-destructive'
                                  )}
                                >
                                  {b.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h2 className="font-serif text-lg font-bold mb-4">Quick Studio Actions</h2>
                        <div className="space-y-2.5">
                          <Button
                            onClick={handleOpenAddPhoto}
                            className="w-full justify-start bg-secondary hover:bg-gold hover:text-black text-foreground border border-border text-xs h-10 font-semibold"
                          >
                            <Plus className="h-4 w-4 mr-2 text-gold" />
                            Upload New Photo
                          </Button>
                          <Button
                            onClick={handleOpenAddService}
                            className="w-full justify-start bg-secondary hover:bg-gold hover:text-black text-foreground border border-border text-xs h-10 font-semibold"
                          >
                            <Plus className="h-4 w-4 mr-2 text-gold" />
                            Add Photography Service
                          </Button>
                          <Button
                            onClick={() => setActiveTab('contact-hours')}
                            className="w-full justify-start bg-secondary hover:bg-gold hover:text-black text-foreground border border-border text-xs h-10 font-semibold"
                          >
                            <Clock className="h-4 w-4 mr-2 text-gold" />
                            Update Studio Hours
                          </Button>
                          <Button
                            onClick={() => setActiveTab('site-content')}
                            className="w-full justify-start bg-secondary hover:bg-gold hover:text-black text-foreground border border-border text-xs h-10 font-semibold"
                          >
                            <Settings className="h-4 w-4 mr-2 text-gold" />
                            Edit Website Text
                          </Button>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/60">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          System Database Connected &amp; Live
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Network Access Card */}
                  <div className="pt-2">
                    <NetworkAccessCard />
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 2: GALLERY MANAGER
                 ======================================================== */}
              {activeTab === 'gallery' && (
                <div className="space-y-6 animate-in fade-in-50">
                  {/* Top toolbar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 bg-card border border-border p-1 rounded-xl">
                        {[
                          { key: 'all', label: 'All' },
                          { key: 'wedding', label: 'Wedding Photo Shoots' },
                          { key: 'portrait', label: 'Indoor Photo Shoots' },
                        ].map((cat) => (
                          <button
                            key={cat.key}
                            onClick={() => {
                              setGalleryFilter(cat.key)
                              setGalleryPage(1)
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                              galleryFilter === cat.key
                                ? 'bg-gold text-black font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Photo Search */}
                      <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search photos by title..."
                          value={gallerySearch}
                          onChange={(e) => {
                            setGallerySearch(e.target.value)
                            setGalleryPage(1)
                          }}
                          className="pl-8 pr-8 h-9 text-xs bg-card"
                        />
                        {gallerySearch && (
                          <button
                            onClick={() => {
                              setGallerySearch('')
                              setGalleryPage(1)
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleOpenAddPhoto}
                      className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs h-10 gap-1.5 shadow-sm shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Add Photo to Gallery
                    </Button>
                  </div>

                  {/* Count & Per-Page Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                    <div>
                      {filteredGallery.length === 0 ? (
                        <span>No photos matching criteria</span>
                      ) : galleryPageSize === -1 ? (
                        <span>Showing all <strong className="text-foreground">{filteredGallery.length}</strong> photos</span>
                      ) : (
                        <span>
                          Showing{' '}
                          <strong className="text-foreground">
                            {(galleryPage - 1) * galleryPageSize + 1}–{Math.min(galleryPage * galleryPageSize, filteredGallery.length)}
                          </strong>{' '}
                          of <strong className="text-foreground">{filteredGallery.length}</strong> photos
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs">Per page:</span>
                      <div className="flex items-center gap-1 bg-card border border-border p-0.5 rounded-lg">
                        {[16, 24, 48, -1].map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              setGalleryPageSize(size)
                              setGalleryPage(1)
                            }}
                            className={cn(
                              'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                              galleryPageSize === size
                                ? 'bg-gold text-black font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {size === -1 ? 'All' : size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo Grid */}
                  {filteredGallery.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                      <Images className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-foreground font-semibold">No photos in this category</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click "Add Photo to Gallery" to upload your first image.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {displayedGallery.map((photo, index) => (
                          <GalleryPhotoCard
                            key={photo.id}
                            photo={photo}
                            onEdit={handlePhotoCardEdit}
                            onDelete={handlePhotoCardDelete}
                            priority={index < 4}
                          />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalGalleryPages > 1 && galleryPageSize !== -1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8">
                          <p className="text-xs text-muted-foreground">
                            Page <span className="font-semibold text-foreground">{galleryPage}</span> of{' '}
                            <span className="font-semibold text-foreground">{totalGalleryPages}</span>
                          </p>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={galleryPage === 1}
                              onClick={() => {
                                setGalleryPage((p) => Math.max(1, p - 1))
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="h-8 px-2.5 text-xs gap-1"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              Prev
                            </Button>

                            {Array.from({ length: totalGalleryPages }, (_, i) => i + 1)
                              .filter((page) => {
                                return (
                                  page === 1 ||
                                  page === totalGalleryPages ||
                                  Math.abs(page - galleryPage) <= 1
                                )
                              })
                              .map((page, idx, arr) => {
                                const prevPage = arr[idx - 1]
                                const showEllipsis = prevPage && page - prevPage > 1

                                return (
                                  <React.Fragment key={page}>
                                    {showEllipsis && (
                                      <span className="px-1.5 text-xs text-muted-foreground">…</span>
                                    )}
                                    <Button
                                      variant={galleryPage === page ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => {
                                        setGalleryPage(page)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                      }}
                                      className={cn(
                                        'h-8 w-8 p-0 text-xs',
                                        galleryPage === page
                                          ? 'bg-gold text-black hover:bg-gold/90 font-bold'
                                          : ''
                                      )}
                                    >
                                      {page}
                                    </Button>
                                  </React.Fragment>
                                )
                              })}

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={galleryPage === totalGalleryPages}
                              onClick={() => {
                                setGalleryPage((p) => Math.min(totalGalleryPages, p + 1))
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="h-8 px-2.5 text-xs gap-1"
                            >
                              Next
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ========================================================
                  TAB 3: SERVICES MANAGER
                 ======================================================== */}
              {activeTab === 'services' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-lg font-bold">Studio Services &amp; Packages</h2>
                      <p className="text-xs text-muted-foreground">
                        Add, edit prices, descriptions, and icons shown on the Services page.
                      </p>
                    </div>

                    <Button
                      onClick={handleOpenAddService}
                      className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs h-10 gap-1.5 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Service
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20">
                              <Layers className="h-5 w-5" />
                            </span>
                            <span className="font-bold text-gold text-base">
                              {service.priceLabel}
                            </span>
                          </div>

                          <h3 className="font-serif text-base font-bold text-foreground mb-1.5">
                            {service.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                            {service.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">
                            Key: {service.key}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditService(service)}
                              className="h-7 px-2 text-xs"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteAction({
                                  type: 'service',
                                  id: service.id,
                                  title: service.title,
                                })
                                setDeleteConfirmOpen(true)
                              }}
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ========================================================
                      PACKAGE PRICING & ADVANCE RATES MANAGER
                     ======================================================== */}
                  <div className="pt-8 border-t border-border/80 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-wider mb-1.5">
                          <DollarSign className="h-3 w-3" />
                          <span>Live Pricing Configuration</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-foreground">
                          Package Pricing &amp; Advance Rates
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Edit the official Advance Deposit or Fixed Rate for each package. Updates take effect immediately across all booking forms and service pages.
                        </p>
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl shrink-0 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => setPackageCategoryTab('all')}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                            packageCategoryTab === 'all'
                              ? 'bg-gold text-black shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          All ({packages.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPackageCategoryTab('indoor')}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                            packageCategoryTab === 'indoor'
                              ? 'bg-gold text-black shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          Indoor ({packages.filter((p) => p.category === 'indoor').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPackageCategoryTab('wedding')}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                            packageCategoryTab === 'wedding'
                              ? 'bg-gold text-black shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          Wedding ({packages.filter((p) => p.category === 'wedding').length})
                        </button>
                      </div>
                    </div>

                    {/* Package Groups */}
                    <div className="space-y-6">
                      {(packageCategoryTab === 'all' || packageCategoryTab === 'indoor') && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                            <Camera className="h-4 w-4 text-gold" />
                            <h4 className="font-serif text-sm font-bold text-foreground">
                              Indoor Studio Photography Packages
                            </h4>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              (Couple, Family, Graduation, Maternity)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                                {packages
                                  .filter((p) => p.category === 'indoor')
                                  .map((pkg) => {
                                    const currentVal = editedPrices[pkg.packageKey] ?? pkg.amount
                                    const currentType = editedPriceTypes[pkg.packageKey] ?? (pkg.priceType === 'fixed' ? 'fixed' : 'advance')
                                    const isDirty =
                                      Number(currentVal) !== pkg.amount ||
                                      currentType !== (pkg.priceType === 'fixed' ? 'fixed' : 'advance')
                                    const isSaving = savingPackageKey === pkg.packageKey

                                    return (
                                      <div
                                        key={pkg.packageKey}
                                        className={cn(
                                          'bg-card border rounded-xl p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm',
                                          isDirty ? 'border-gold/60 ring-1 ring-gold/20' : 'border-border'
                                        )}
                                      >
                                        <div className="space-y-1 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">
                                              {pkg.name}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary text-foreground/80 border border-border">
                                              {pkg.subCategory === 'couple' && 'Couple / Pre-Wedding'}
                                              {pkg.subCategory === 'family' && 'Family Shoot'}
                                              {pkg.subCategory === 'graduation' && 'Graduation Shoot'}
                                              {pkg.subCategory === 'maternity' && 'Maternity Shoot'}
                                            </span>
                                            <span
                                              className={cn(
                                                'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                                                currentType === 'fixed'
                                                  ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                                                  : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                              )}
                                            >
                                              {currentType === 'fixed' ? 'Fixed Price' : 'Advance Price'}
                                            </span>
                                          </div>
                                          {pkg.description && (
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                              {pkg.description}
                                            </p>
                                          )}
                                        </div>

                                        {/* Price & Price-Type Edit Controls */}
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 shrink-0">
                                          {/* Price Type Option Selector */}
                                          <div className="inline-flex rounded-lg p-0.5 bg-secondary/80 border border-border">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setEditedPriceTypes((prev) => ({
                                                  ...prev,
                                                  [pkg.packageKey]: 'advance',
                                                }))
                                              }
                                              className={cn(
                                                'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap',
                                                currentType === 'advance'
                                                  ? 'bg-emerald-600 text-white shadow-sm'
                                                  : 'text-muted-foreground hover:text-foreground'
                                              )}
                                            >
                                              Advance Price
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setEditedPriceTypes((prev) => ({
                                                  ...prev,
                                                  [pkg.packageKey]: 'fixed',
                                                }))
                                              }
                                              className={cn(
                                                'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap',
                                                currentType === 'fixed'
                                                  ? 'bg-blue-600 text-white shadow-sm'
                                                  : 'text-muted-foreground hover:text-foreground'
                                              )}
                                            >
                                              Fixed Price
                                            </button>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <div className="relative w-36 sm:w-40">
                                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                                                NPR
                                              </span>
                                              <Input
                                                type="number"
                                                min="100"
                                                step="500"
                                                value={currentVal}
                                                onChange={(e) => {
                                                  const val = e.target.value
                                                  setEditedPrices((prev) => ({
                                                    ...prev,
                                                    [pkg.packageKey]: val,
                                                  }))
                                                }}
                                                className="pl-11 h-9 text-xs font-mono font-bold bg-background text-foreground"
                                                placeholder="Price (NPR)"
                                              />
                                            </div>

                                            <Button
                                              size="sm"
                                              onClick={() => handleSavePackagePrice(pkg.packageKey)}
                                              disabled={isSaving || !isDirty || !currentVal || Number(currentVal) <= 0}
                                              className={cn(
                                                'h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-sm transition-all',
                                                isDirty
                                                  ? 'bg-gold text-black hover:bg-gold/90'
                                                  : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                              )}
                                            >
                                              {isSaving ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                              ) : (
                                                <Save className="h-3.5 w-3.5" />
                                              )}
                                              <span>Save</span>
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                          </div>
                        </div>
                      )}

                      {(packageCategoryTab === 'all' || packageCategoryTab === 'wedding') && (
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                            <Sparkles className="h-4 w-4 text-gold" />
                            <h4 className="font-serif text-sm font-bold text-foreground">
                              Wedding Ceremonial Packages
                            </h4>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              (Bride Side, Combo, Groom Side)
                            </span>
                          </div>

                          {/* Group by Wedding Side */}
                          {(['bride', 'combo', 'groom'] as const).map((side) => {
                            const sidePackages = packages.filter(
                              (p) => p.category === 'wedding' && p.subCategory === side
                            )
                            if (sidePackages.length === 0) return null

                            const sideTitle =
                              side === 'bride'
                                ? 'Bride Side Packages'
                                : side === 'combo'
                                ? 'Combo (Both Sides) Packages'
                                : 'Groom Side Packages'

                            return (
                              <div key={side} className="space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-bold text-foreground/80 pl-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                                  <span>{sideTitle}</span>
                                </div>

                                <div className="grid grid-cols-1 gap-2.5">
                                  {sidePackages.map((pkg) => {
                                    const currentVal = editedPrices[pkg.packageKey] ?? pkg.amount
                                    const currentType = editedPriceTypes[pkg.packageKey] ?? (pkg.priceType === 'fixed' ? 'fixed' : 'advance')
                                    const isDirty =
                                      Number(currentVal) !== pkg.amount ||
                                      currentType !== (pkg.priceType === 'fixed' ? 'fixed' : 'advance')
                                    const isSaving = savingPackageKey === pkg.packageKey

                                    return (
                                      <div
                                        key={pkg.packageKey}
                                        className={cn(
                                          'bg-card border rounded-xl p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm',
                                          isDirty ? 'border-gold/60 ring-1 ring-gold/20' : 'border-border'
                                        )}
                                      >
                                        <div className="space-y-1 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">
                                              {pkg.name}
                                            </span>
                                            <span
                                              className={cn(
                                                'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                                                pkg.isTbd && !isDirty
                                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                                  : currentType === 'fixed'
                                                  ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                                                  : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                              )}
                                            >
                                              {pkg.isTbd && !isDirty
                                                ? 'Deposit (TBD Ceremony)'
                                                : currentType === 'fixed'
                                                ? 'Fixed Price'
                                                : 'Advance Price'}
                                            </span>
                                          </div>
                                          {pkg.description && (
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                              {pkg.description}
                                            </p>
                                          )}
                                          {pkg.isTbd && (
                                            <p className="text-[11px] text-amber-500/90 font-medium">
                                              Set price and choose Fixed or Advance to replace &ldquo;TBD&rdquo; with active rate.
                                            </p>
                                          )}
                                        </div>

                                        {/* Price & Price-Type Edit Controls */}
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 shrink-0">
                                          {/* Price Type Option Selector */}
                                          <div className="inline-flex rounded-lg p-0.5 bg-secondary/80 border border-border">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setEditedPriceTypes((prev) => ({
                                                  ...prev,
                                                  [pkg.packageKey]: 'advance',
                                                }))
                                              }
                                              className={cn(
                                                'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap',
                                                currentType === 'advance'
                                                  ? 'bg-emerald-600 text-white shadow-sm'
                                                  : 'text-muted-foreground hover:text-foreground'
                                              )}
                                            >
                                              Advance Price
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setEditedPriceTypes((prev) => ({
                                                  ...prev,
                                                  [pkg.packageKey]: 'fixed',
                                                }))
                                              }
                                              className={cn(
                                                'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap',
                                                currentType === 'fixed'
                                                  ? 'bg-blue-600 text-white shadow-sm'
                                                  : 'text-muted-foreground hover:text-foreground'
                                              )}
                                            >
                                              Fixed Price
                                            </button>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <div className="relative w-36 sm:w-40">
                                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                                                NPR
                                              </span>
                                              <Input
                                                type="number"
                                                min="100"
                                                step="500"
                                                value={currentVal}
                                                onChange={(e) => {
                                                  const val = e.target.value
                                                  setEditedPrices((prev) => ({
                                                    ...prev,
                                                    [pkg.packageKey]: val,
                                                  }))
                                                }}
                                                className="pl-11 h-9 text-xs font-mono font-bold bg-background text-foreground"
                                                placeholder="Price (NPR)"
                                              />
                                            </div>

                                            <Button
                                              size="sm"
                                              onClick={() => handleSavePackagePrice(pkg.packageKey)}
                                              disabled={isSaving || !isDirty || !currentVal || Number(currentVal) <= 0}
                                              className={cn(
                                                'h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-sm transition-all',
                                                isDirty
                                                  ? 'bg-gold text-black hover:bg-gold/90'
                                                  : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                              )}
                                            >
                                              {isSaving ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                              ) : (
                                                <Save className="h-3.5 w-3.5" />
                                              )}
                                              <span>Save</span>
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 4: BOOKINGS MANAGER
                 ======================================================== */}
              {activeTab === 'bookings' && (
                <div className="space-y-6 animate-in fade-in-50">
                  {/* Search and Filters */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by client, phone, email..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="pl-9 h-10 bg-card border-border text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl overflow-x-auto">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setBookingFilter(st)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors',
                              bookingFilter === st
                                ? 'bg-gold text-black font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-xl">
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <Select value={bookingSort} onValueChange={(val: any) => setBookingSort(val)}>
                          <SelectTrigger className="h-8 text-xs border-0 bg-transparent p-0 focus:ring-0 w-44">
                            <SelectValue placeholder="Sort Bookings" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created-desc">Booked: Newest First</SelectItem>
                            <SelectItem value="created-asc">Booked: Oldest First</SelectItem>
                            <SelectItem value="date-asc">Reserved: Earliest Date</SelectItem>
                            <SelectItem value="date-desc">Reserved: Latest Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {filteredBookings.length === 0 ? (
                      <div className="p-12 text-center">
                        <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-semibold text-foreground">No bookings found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Booking inquiries sent from the website will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-secondary/60 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                            <tr>
                              <th className="py-3.5 px-4">Client</th>
                              <th className="py-3.5 px-4">Service</th>
                              <th className="py-3.5 px-4">Reserved Date (BS)</th>
                              <th className="py-3.5 px-4">Booked On (BS)</th>
                              <th className="py-3.5 px-4">Notes</th>
                              <th className="py-3.5 px-4">Status</th>
                              <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredBookings.map((b) => (
                              <tr key={b.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="py-3.5 px-4">
                                  <p className="font-semibold text-foreground">{b.name}</p>
                                  <div className="text-[11px] text-muted-foreground space-y-0.5 mt-0.5">
                                    <p className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" /> {b.phone}
                                    </p>
                                    <p className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" /> {b.email}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-medium text-foreground">
                                  {b.service}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5 font-mono text-xs">
                                      <Calendar className="h-3.5 w-3.5 text-gold shrink-0" />
                                      {formatEventDate(b.date)}
                                    </span>
                                    {b.date && (
                                      <span className="text-[10px] text-muted-foreground/70 font-mono pl-5">
                                        AD: {b.date}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                    <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
                                    <span>{formatTimestamp(b.createdAt)}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 max-w-xs text-muted-foreground truncate">
                                  {b.message || '—'}
                                </td>
                                <td className="py-3.5 px-4">
                                  <Select
                                    value={b.status}
                                    onValueChange={(val) => handleUpdateBookingStatus(b.id, val)}
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        'h-7 text-xs font-semibold rounded-lg w-28',
                                        b.status === 'confirmed' && 'bg-green-500/15 text-green-500 border-green-500/30',
                                        b.status === 'pending' && 'bg-amber-500/15 text-amber-500 border-amber-500/30',
                                        b.status === 'completed' && 'bg-blue-500/15 text-blue-500 border-blue-500/30',
                                        b.status === 'cancelled' && 'bg-destructive/15 text-destructive border-destructive/30'
                                      )}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setDeleteAction({
                                        type: 'booking',
                                        id: b.id,
                                        title: `${b.name} (${b.service})`,
                                      })
                                      setDeleteConfirmOpen(true)
                                    }}
                                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 5: PAYMENTS MANAGER
                 ======================================================== */}
              {activeTab === 'payments' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-lg font-bold">Payment Transactions</h2>
                      <p className="text-xs text-muted-foreground">
                        Customer payments initiated or completed through eSewa &amp; Bank.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl">
                        {['all', 'esewa', 'bank', 'paid'].map((g) => (
                          <button
                            key={g}
                            onClick={() => setPaymentFilter(g)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                              paymentFilter === g
                                ? 'bg-gold text-black font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {g}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-xl">
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <Select value={paymentSort} onValueChange={(val: any) => setPaymentSort(val)}>
                          <SelectTrigger className="h-8 text-xs border-0 bg-transparent p-0 focus:ring-0 w-44">
                            <SelectValue placeholder="Sort Payments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created-desc">Paid: Newest First</SelectItem>
                            <SelectItem value="created-asc">Paid: Oldest First</SelectItem>
                            <SelectItem value="amount-desc">Amount: High to Low</SelectItem>
                            <SelectItem value="amount-asc">Amount: Low to High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {filteredPayments.length === 0 ? (
                      <div className="p-12 text-center">
                        <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-semibold text-foreground">No payment records</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Payments made through the online checkout will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-secondary/60 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                            <tr>
                              <th className="py-3.5 px-4">Gateway</th>
                              <th className="py-3.5 px-4">Customer</th>
                              <th className="py-3.5 px-4">Package</th>
                              <th className="py-3.5 px-4">Amount</th>
                              <th className="py-3.5 px-4">Paid On (BS)</th>
                              <th className="py-3.5 px-4">Transaction ID</th>
                              <th className="py-3.5 px-4">Status</th>
                              <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredPayments.map((p) => (
                              <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="py-3.5 px-4">
                                  <span
                                    className={cn(
                                      'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                                      p.gateway === 'esewa' && 'bg-green-500/20 text-green-500 border border-green-500/30',
                                      p.gateway === 'khalti' && 'bg-purple-500/20 text-purple-500 border border-purple-500/30',
                                      p.gateway === 'bank' && 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                    )}
                                  >
                                    {p.gateway}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <p className="font-semibold text-foreground">{p.customerName}</p>
                                  <p className="text-[11px] text-muted-foreground">{p.customerPhone}</p>
                                </td>
                                <td className="py-3.5 px-4 font-medium text-foreground">
                                  {p.packageName}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-gold text-sm">
                                  Rs. {p.amount.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                    <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
                                    <span>{formatTimestamp(p.createdAt)}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                                  {p.transactionUuid}
                                </td>
                                <td className="py-3.5 px-4">
                                  <Select
                                    value={p.status}
                                    onValueChange={(val) => handleUpdatePaymentStatus(p.id, val)}
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        'h-7 text-xs font-semibold rounded-lg w-28',
                                        p.status === 'paid' && 'bg-green-500/15 text-green-500 border-green-500/30',
                                        p.status === 'initiated' && 'bg-amber-500/15 text-amber-500 border-amber-500/30',
                                        p.status === 'failed' && 'bg-destructive/15 text-destructive border-destructive/30',
                                        p.status === 'refunded' && 'bg-blue-500/15 text-blue-500 border-blue-500/30'
                                      )}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="initiated">Initiated</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                      <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setDeleteAction({
                                        type: 'payment',
                                        id: p.id,
                                        title: `Payment: ${p.transactionUuid}`,
                                      })
                                      setDeleteConfirmOpen(true)
                                    }}
                                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB: DIRECT CONTACT INQUIRIES / MESSAGES
                 ======================================================== */}
              {activeTab === 'messages' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="font-serif text-xl font-bold">Direct Contact Messages</h2>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gold/20 text-gold">
                            {messages.length} total
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Inquiries submitted by customers via the &quot;Send a Direct Note&quot; website contact form.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Search by name, email, or message..."
                            value={messageSearch}
                            onChange={(e) => setMessageSearch(e.target.value)}
                            className="pl-9 h-9 text-xs bg-background border-border"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-xl">
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Select value={messageSort} onValueChange={(val: any) => setMessageSort(val)}>
                            <SelectTrigger className="h-7 text-xs border-0 bg-transparent p-0 focus:ring-0 w-36">
                              <SelectValue placeholder="Sort Messages" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="created-desc">Received: Newest</SelectItem>
                              <SelectItem value="created-asc">Received: Oldest</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {filteredMessages.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-border rounded-xl">
                        <Mail className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-foreground">No messages found</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                          {messages.length === 0
                            ? 'When customers submit a direct note from the website, their message will appear here safely.'
                            : 'No messages match your current search term.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredMessages.map((m) => (
                          <div
                            key={m.id}
                            className="bg-secondary/30 hover:bg-secondary/50 border border-border/80 rounded-xl p-5 transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gold/15 border border-gold/30 text-gold font-bold flex items-center justify-center text-sm shrink-0">
                                  {m.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-sm text-foreground">{m.name}</h3>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                                      {m.subject}
                                    </span>
                                  </div>
                                  <a
                                    href={`mailto:${m.email}`}
                                    className="text-xs text-gold hover:underline"
                                  >
                                    {m.email}
                                  </a>
                                </div>
                              </div>

                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-[11px] text-muted-foreground self-start sm:self-center">
                                <Clock className="h-3 w-3 text-gold shrink-0" />
                                <span className="font-semibold text-foreground/80">Received On (BS):</span>
                                <span className="font-mono">{formatTimestamp(m.createdAt)}</span>
                              </div>
                            </div>

                            <div className="bg-background/80 border border-border/60 rounded-lg p-4 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {m.message}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="h-8 text-xs gap-1.5 border-gold/40 text-gold hover:bg-gold/10"
                                >
                                  <a
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                      m.email
                                    )}&su=${encodeURIComponent('Re: ' + m.subject)}&body=${encodeURIComponent(
                                      `Hi ${m.name},\n\nThank you for reaching out to Wedding Moment Nepal!\n\n`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                    Reply via Email
                                  </a>
                                </Button>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setDeleteAction({
                                    type: 'message',
                                    id: m.id,
                                    title: `Message from ${m.name}`,
                                  })
                                  setDeleteConfirmOpen(true)
                                }}
                                className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 6: STUDIO HOURS & CONTACT INFO
                 ======================================================== */}
              {activeTab === 'contact-hours' && (
                <div className="space-y-8 animate-in fade-in-50">
                  {/* Studio Hours */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-serif text-lg font-bold">Weekly Studio Hours</h2>
                        <p className="text-xs text-muted-foreground">
                          These hours display in the site footer and contact section.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleAddHourRow}
                        className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs h-8"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Day / Row
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {studioHours.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Input
                            placeholder="Day (e.g. Sunday – Friday)"
                            value={row.day}
                            onChange={(e) => handleHourChange(idx, 'day', e.target.value)}
                            className="w-1/2 bg-background border-border text-xs"
                          />
                          <Input
                            placeholder="Hours (e.g. 10:00 AM – 7:00 PM)"
                            value={row.time}
                            onChange={(e) => handleHourChange(idx, 'time', e.target.value)}
                            className="w-1/2 bg-background border-border text-xs"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveHourRow(idx)}
                            className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="font-serif text-lg font-bold mb-1">Contact &amp; Location Information</h2>
                    <p className="text-xs text-muted-foreground mb-5">
                      Phone, Email, Address, and Map Links shown across the site.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Phone Number
                        </Label>
                        <Input
                          value={siteSettings.phone || ''}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="bg-background border-border text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Email Address
                        </Label>
                        <Input
                          value={siteSettings.email || ''}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="bg-background border-border text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Physical Address
                        </Label>
                        <Input
                          value={siteSettings.address || ''}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({ ...prev, address: e.target.value }))
                          }
                          className="bg-background border-border text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Google Maps Link URL
                        </Label>
                        <Input
                          value={siteSettings.mapLinkUrl || ''}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({ ...prev, mapLinkUrl: e.target.value }))
                          }
                          className="bg-background border-border text-xs"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => handleSaveSettingsAndHours('hours')}
                        className="bg-gold text-black hover:bg-gold/90 font-semibold gap-1.5 text-xs h-10 shadow-sm"
                      >
                        <Save className="h-4 w-4" /> Save Hours &amp; Contact Info
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 7: HOMEPAGE & FOOTER CONTENT
                 ======================================================== */}
              {activeTab === 'site-content' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="font-serif text-lg font-bold mb-1">Website Brand &amp; Text Content</h2>
                    <p className="text-xs text-muted-foreground mb-6">
                      Customize studio branding, hero section subtitles, tagline, and established year.
                    </p>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Brand Name
                          </Label>
                          <Input
                            value={siteSettings.brand || ''}
                            onChange={(e) =>
                              setSiteSettings((prev) => ({ ...prev, brand: e.target.value }))
                            }
                            className="bg-background border-border text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Established Year (Since)
                          </Label>
                          <Input
                            value={siteSettings.since || ''}
                            onChange={(e) =>
                              setSiteSettings((prev) => ({ ...prev, since: e.target.value }))
                            }
                            className="bg-background border-border text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Tagline
                        </Label>
                        <Input
                          value={siteSettings.tagline || ''}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({ ...prev, tagline: e.target.value }))
                          }
                          className="bg-background border-border text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Hero Subtitle
                        </Label>
                        <Textarea
                          rows={3}
                          value={siteSettings.heroSubtitle || ''}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                          }
                          className="bg-background border-border text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Footer Note / Studio Mission
                        </Label>
                        <Textarea
                          rows={3}
                          value={siteSettings.footerNote || ''}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({ ...prev, footerNote: e.target.value }))
                          }
                          className="bg-background border-border text-xs"
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-5 border-t border-border flex justify-end">
                      <Button
                        onClick={() => handleSaveSettingsAndHours('content')}
                        className="bg-gold text-black hover:bg-gold/90 font-semibold gap-1.5 text-xs h-10 shadow-sm"
                      >
                        <Save className="h-4 w-4" /> Save Content Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ========================================================
          MODAL: ADD / EDIT GALLERY PHOTO
         ======================================================== */}
      <Dialog open={galleryModalOpen} onOpenChange={setGalleryModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90dvh] overflow-y-auto p-6 pt-7 sm:p-7 sm:pt-8 shadow-2xl">
          <DialogHeader className="pr-12 sm:pr-14">
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Images className="h-5 w-5 text-gold" />
              {editingPhoto ? 'Edit Photo Details' : 'Upload New Photo'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add photos to your studio gallery with title and category tag. Form changes are auto-saved.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePhoto} className="space-y-4 pt-2">
            {/* Image Preview & Upload Dropzone */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Photo Image
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files?.[0]) {
                    handleFileUpload(e.dataTransfer.files[0])
                  }
                }}
                className={cn(
                  'relative border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-gold transition-colors flex flex-col items-center justify-center min-h-[160px] bg-background',
                  photoForm.src && 'border-gold/50'
                )}
              >
                {photoForm.src ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden">
                    <Image
                      src={photoForm.src}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Upload className="h-4 w-4" /> Click to replace
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    {uploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    )}
                    <p className="text-xs font-semibold text-foreground">
                      Drag &amp; drop an image, or click to browse
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      JPEG, PNG, WebP up to 15MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
                  }}
                  className="hidden"
                />
              </div>

              {/* Or manual URL */}
              <div className="pt-1">
                <Input
                  placeholder="Or paste external image URL"
                  value={photoForm.src}
                  onChange={(e) => setPhotoForm((prev) => ({ ...prev, src: e.target.value }))}
                  className="text-xs bg-background border-border h-8 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Title
                </Label>
                <Input
                  placeholder="e.g. Sacred Vows"
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-background border-border text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Main Category
                </Label>
                <Select
                  value={photoForm.category}
                  onValueChange={(val) =>
                    setPhotoForm((prev) => ({
                      ...prev,
                      category: val,
                      subcategory: val === 'wedding' ? 'all-included' : '',
                    }))
                  }
                >
                  <SelectTrigger className="bg-background border-border text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding Photo Shoots</SelectItem>
                    <SelectItem value="portrait">Indoor Photo Shoots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub-Category Dropdown — Dynamic based on Main Category */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Sub-Category Event / Shoot Type</span>
                <span className="text-[10px] text-gold font-normal">
                  {photoForm.category === 'wedding' ? 'Ceremonial Event' : 'Indoor Shoot Type'}
                </span>
              </Label>
              <Select
                value={photoForm.subcategory || (photoForm.category === 'wedding' ? 'all-included' : 'none')}
                onValueChange={(val) =>
                  setPhotoForm((prev) => ({ ...prev, subcategory: val === 'none' ? '' : val }))
                }
              >
                <SelectTrigger className="bg-background border-border text-xs h-9">
                  <SelectValue placeholder="Select specific shoot/event type" />
                </SelectTrigger>
                <SelectContent>
                  {photoForm.category === 'wedding' ? (
                    <>
                      <SelectItem value="all-included">All Included (Full Package / Default)</SelectItem>
                      <SelectItem value="bridetobe">Bride to Be</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="mehendi">Mehendi</SelectItem>
                      <SelectItem value="marriage">Marriage</SelectItem>
                      <SelectItem value="reception">Reception</SelectItem>
                      <SelectItem value="postshoot">Post Shoot</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="none">All / General Studio</SelectItem>
                      <SelectItem value="couplepre-wedding">Couple / Pre-Wedding</SelectItem>
                      <SelectItem value="family">Family Photoshoot</SelectItem>
                      <SelectItem value="graduation">Graduation Photoshoot</SelectItem>
                      <SelectItem value="maternity">Maternity Photoshoot</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Description / Caption (Optional)
              </Label>
              <Textarea
                rows={2}
                placeholder="A brief description of the photo..."
                value={photoForm.description}
                onChange={(e) =>
                  setPhotoForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="bg-background border-border text-xs"
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
              {!editingPhoto && (photoForm.title || photoForm.description || photoForm.src) ? (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem(DRAFT_STORAGE_KEY)
                    } catch {}
                    setPhotoForm({ title: '', category: 'wedding', subcategory: '', description: '', src: '' })
                    toast.info('Draft cleared')
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Clear Draft
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGalleryModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingImage}
                  className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs"
                >
                  {editingPhoto ? 'Save Changes' : 'Add to Gallery'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          MODAL: ADD / EDIT SERVICE
         ======================================================== */}
      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90dvh] overflow-y-auto p-6 pt-7 sm:p-7 sm:pt-8 shadow-2xl">
          <DialogHeader className="pr-12 sm:pr-14">
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Layers className="h-5 w-5 text-gold" />
              {editingService ? 'Edit Photography Service' : 'Add Photography Service'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the service title, price tag, icon and description.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Service Title
              </Label>
              <Input
                placeholder="e.g. Wedding Photography"
                value={serviceForm.title}
                onChange={(e) =>
                  setServiceForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                    key:
                      prev.key ||
                      e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  }))
                }
                className="bg-background border-border text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Starting Price (NPR)
                </Label>
                <Input
                  type="number"
                  placeholder="2999"
                  value={serviceForm.priceFrom}
                  onChange={(e) => {
                    const num = Number(e.target.value)
                    setServiceForm((prev) => ({
                      ...prev,
                      priceFrom: num,
                      priceLabel: `रु ${num.toLocaleString()}+`,
                    }))
                  }}
                  className="bg-background border-border text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Price Label (Display)
                </Label>
                <Input
                  placeholder="रु 2,999+"
                  value={serviceForm.priceLabel}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, priceLabel: e.target.value }))
                  }
                  className="bg-background border-border text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <Textarea
                rows={3}
                placeholder="Describe what is included in this photography package..."
                value={serviceForm.description}
                onChange={(e) =>
                  setServiceForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="bg-background border-border text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setServiceModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs"
              >
                {editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          MODAL: IN-PLACE QUICK RE-LOGIN (NO WORK LOST)
         ======================================================== */}
      <Dialog open={quickLoginOpen} onOpenChange={setQuickLoginOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2 text-gold">
              <Lock className="h-5 w-5" />
              Session Expired — Re-authenticate
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your security session expired. Enter your password to refresh your session without losing your current form edits.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuickLogin} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                type="email"
                value={quickLoginEmail}
                onChange={(e) => setQuickLoginEmail(e.target.value)}
                className="bg-background border-border text-xs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={quickLoginPassword}
                onChange={(e) => setQuickLoginPassword(e.target.value)}
                className="bg-background border-border text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuickLoginOpen(false)}
                className="text-xs"
              >
                Dismiss
              </Button>
              <Button
                type="submit"
                disabled={quickLoginLoading}
                className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs"
              >
                {quickLoginLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : null}
                Resume Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          ALERT DIALOG: DELETE CONFIRMATION
         ======================================================== */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                "{deleteAction?.title}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
