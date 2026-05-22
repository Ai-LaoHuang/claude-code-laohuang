import type { LocalCommandCall } from '../../types/command.js'
import { getCompanion, roll, companionUserId } from '../../buddy/companion.js'
import type {
  Rarity,
  Species,
  StatName,
  StoredCompanion,
} from '../../buddy/types.js'
import { RARITY_STARS, STAT_NAMES } from '../../buddy/types.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'

const SPECIES_NAMES: Record<Species, string[]> = {
  duck: ['Pebble', 'Puddle', 'Quill'],
  goose: ['Honk', 'Gizmo', 'Mochi'],
  blob: ['Gloop', 'Boba', 'Mallow'],
  cat: ['Pixel', 'Miso', 'Nimbus'],
  dragon: ['Ember', 'Cinder', 'Rune'],
  octopus: ['Ink', 'Tako', 'Ripple'],
  owl: ['Pico', 'Hoot', 'Clover'],
  penguin: ['Waddle', 'Frost', 'Pip'],
  turtle: ['Moss', 'Shellby', 'Drift'],
  snail: ['Spiral', 'Dewdrop', 'Pebby'],
  ghost: ['Whisp', 'Lumen', 'Echo'],
  axolotl: ['Bloop', 'Coral', 'Nori'],
  capybara: ['Biscuit', 'Poco', 'Sunny'],
  cactus: ['Spike', 'Prickle', 'Sage'],
  robot: ['Servo', 'Dot', 'Nova'],
  rabbit: ['Bun', 'Thimble', 'Poppy'],
  mushroom: ['Spores', 'Button', 'Truffle'],
  chonk: ['Bao', 'Chunk', 'Puff'],
}

const PERSONALITY_BY_RARITY: Record<Rarity, string[]> = {
  common: ['cozy', 'curious', 'cheerful'],
  uncommon: ['playful', 'bright', 'steady'],
  rare: ['clever', 'sparkly', 'adventurous'],
  epic: ['dramatic', 'heroic', 'chaotic-good'],
  legendary: ['mythic', 'radiant', 'world-class'],
}

function pickStable<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length]!
}

function createStoredCompanion(): StoredCompanion {
  const rollResult = roll(companionUserId())
  const seed = rollResult.inspirationSeed
  return {
    name: pickStable(SPECIES_NAMES[rollResult.bones.species], seed),
    personality: pickStable(
      PERSONALITY_BY_RARITY[rollResult.bones.rarity],
      seed >> 3,
    ),
    hatchedAt: Date.now(),
  }
}

function describeCompanion(): string {
  const companion = getCompanion()
  if (!companion) {
    return 'No companion has hatched yet. Run /buddy to hatch one.'
  }

  const muted = getGlobalConfig().companionMuted ? 'muted' : 'active'
  const stats = STAT_NAMES.map((name: StatName) => {
    return `- ${name}: ${companion.stats[name]}`
  }).join('\n')

  return [
    `${companion.name} is your ${companion.rarity} ${companion.species}. ${RARITY_STARS[companion.rarity]}`,
    `Personality: ${companion.personality}`,
    'Stats:',
    stats,
    `Status: ${muted}`,
    'Commands: /buddy, /buddy info, /buddy rename <name>, /buddy mute, /buddy unmute',
  ].join('\n')
}

function setReaction(
  context: Parameters<LocalCommandCall>[1],
  reaction: string,
): void {
  context.setAppState(prev => ({
    ...prev,
    companionReaction: reaction,
  }))
}

function markPet(
  context: Parameters<LocalCommandCall>[1],
  reaction: string,
): void {
  context.setAppState(prev => ({
    ...prev,
    companionReaction: reaction,
    companionPetAt: Date.now(),
  }))
}

export const call: LocalCommandCall = async (args, context) => {
  const trimmed = args.trim()
  const [subcommand, ...rest] = trimmed.split(/\s+/).filter(Boolean)
  const sub = subcommand?.toLowerCase()
  const renameTarget = rest.join(' ').trim()

  if (sub === 'info' || sub === 'status') {
    return { type: 'text', value: describeCompanion() }
  }

  if (sub === 'mute') {
    saveGlobalConfig(current => ({ ...current, companionMuted: true }))
    return { type: 'text', value: 'Companion muted.' }
  }

  if (sub === 'unmute') {
    saveGlobalConfig(current => ({ ...current, companionMuted: false }))
    return { type: 'text', value: 'Companion unmuted.' }
  }

  if (sub === 'rename') {
    const companion = getCompanion()
    if (!companion) {
      return {
        type: 'text',
        value: 'No companion has hatched yet. Run /buddy first.',
      }
    }
    if (!renameTarget) {
      return { type: 'text', value: 'Usage: /buddy rename <name>' }
    }
    saveGlobalConfig(current => ({
      ...current,
      companion: { ...current.companion!, name: renameTarget },
    }))
    setReaction(context, `${renameTarget} wiggles happily.`)
    return { type: 'text', value: `Companion renamed to ${renameTarget}.` }
  }

  if (sub === 'pet') {
    const companion = getCompanion()
    if (!companion) {
      return {
        type: 'text',
        value: 'No companion has hatched yet. Run /buddy first.',
      }
    }
    markPet(context, `${companion.name} melts into the pats.`)
    return {
      type: 'text',
      value: `You pet ${companion.name}. Tiny hearts drift upward.`,
    }
  }

  let companion = getCompanion()
  if (!companion) {
    const stored = createStoredCompanion()
    saveGlobalConfig(current => ({
      ...current,
      companion: stored,
      companionMuted: false,
    }))
    companion = getCompanion()
    if (!companion) {
      return { type: 'text', value: 'Failed to hatch companion.' }
    }
    setReaction(
      context,
      `${companion.name} hatched and immediately claimed the warmest pixel.`,
    )
    return {
      type: 'text',
      value: [
        `A ${companion.rarity} ${companion.species} named ${companion.name} hatched.`,
        `Personality: ${companion.personality}`,
      ].join('\n'),
    }
  }

  markPet(context, `${companion.name} leans in for pets.`)
  return {
    type: 'text',
    value: `You pet ${companion.name} the ${companion.species}.`,
  }
}
