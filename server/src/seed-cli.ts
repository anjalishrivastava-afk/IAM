import { closeDb, getDb } from './db.js'
import { runSeed } from './seed.js'

try {
  runSeed(getDb())
} finally {
  closeDb()
}
