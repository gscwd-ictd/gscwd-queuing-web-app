import { Counter } from "./counter"
import { User } from "./user"

export type UserSession = {
  id: string
  counterId: string
  userId: string
  expiresAt: Date | null
}

export type UserSessionWithCounter = UserSession & {
  user: Pick<User, "firstName" | "lastName">
  counter: Pick<Counter, "code" | "name">
}
