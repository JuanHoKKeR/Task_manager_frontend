// src/types/index.ts
export interface Tag {
  id: number
  name: string
}

export interface Task {
  id: number
  title: string
  attachment?: string | File | null // URI, nullable
  tags: Tag[]
  description?: string
  status: 'pending' | 'completed' | 'abandoned'
  deadline: string // Fecha en formato ISO
  created_at: string // Fecha en formato ISO, readOnly
  user: number // ID del usuario, readOnly
}

export interface User {
  id: number
  username: string
  email: string
}
