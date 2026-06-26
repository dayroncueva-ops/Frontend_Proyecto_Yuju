export type UserRole = 'STUDENT' | 'EXTERNAL' | 'ADMIN'
export type MaterialType = 'PDF' | 'VIDEO' | 'NOTE'
export type TransactionType = 'SALE' | 'EXCHANGE'
export type PublicationStatus = 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'CLOSED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type PlanStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'STRIPE' | 'EXCHANGE' | 'FREE'
export type RecommendationType = 'STUDY_PLAN' | 'MATERIAL' | 'MOTIVATION' | 'HABIT'
export type View = 'dashboard' | 'planner' | 'materials' | 'marketplace' | 'mentor'
export type AuthMode = 'login' | 'register'
export type Notice = { type: 'ok' | 'error'; message: string } | null

export type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  age: number
  role: UserRole
  accountStatus: string
  registeredAt: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: User
}

export type Session = AuthResponse

export type Material = {
  id: number
  title: string
  description: string
  materialType: MaterialType
  category: string
  price: number
  fileUrl: string
  publishedAt: string
  available: boolean
  ownerId: number
  ownerUsername: string
}

export type Listing = {
  id: number
  materialId: number
  materialTitle: string
  transactionType: TransactionType
  publicationStatus: PublicationStatus
  stock: number
  publishedAt: string
  sellerId: number
  sellerUsername: string
}

export type Planner = {
  id: number
  userId: number
  weeklyGoal: string
  targetHours: number
  startDate: string
  endDate: string
  priority: Priority
  planStatus: PlanStatus
}

export type Progress = {
  id: number
  userId: number
  studyHours: number
  completedGoals: number
  currentStreak: number
  motivationLevel: number
  lastUpdatedAt: string
}

export type Recommendation = {
  id: number
  userId: number
  content: string
  recommendationType: RecommendationType
  relevance: number
  generatedAt: string
}

export type Transaction = {
  id: number
  buyerId: number
  sellerId: number
  materialId: number
  materialTitle: string
  amount: number
  paymentMethod: PaymentMethod
  status: string
  transactionDate: string
}

export type LoginForm = { email: string; password: string }
export type RegisterForm = { firstName: string; lastName: string; email: string; password: string; username: string; age: number }
export type PlannerForm = Omit<Planner, 'id' | 'userId'>
export type ProgressForm = Omit<Progress, 'id' | 'userId' | 'lastUpdatedAt'>
export type MaterialForm = Omit<Material, 'id' | 'publishedAt' | 'available' | 'ownerId' | 'ownerUsername'>
export type ListingForm = { materialId: string; transactionType: TransactionType; stock: number }
