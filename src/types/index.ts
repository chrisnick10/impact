export interface Job {
  id: number
  company: string
  title: string
  start_date: string
  end_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface Bullet {
  id: number
  job_id: number
  mode: 'custom' | 'imm'
  custom_text: string | null
  imm_impact: string | null
  imm_method: string | null
  imm_metric: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BulletWithTags extends Bullet {
  tags: Tag[]
}

export interface JDSession {
  id: number
  title: string
  jd_text: string
  created_at: string
  updated_at: string
}

export interface JDSessionWithBullets extends JDSession {
  bullet_ids: number[]
}

export interface NewBulletPayload {
  job_id: number
  mode: 'custom' | 'imm'
  custom_text?: string | null
  imm_impact?: string | null
  imm_method?: string | null
  imm_metric?: string | null
  tag_ids?: number[]
}

export interface UpdateBulletPayload {
  id: number
  mode?: 'custom' | 'imm'
  custom_text?: string | null
  imm_impact?: string | null
  imm_method?: string | null
  imm_metric?: string | null
  tag_ids?: number[]
}
