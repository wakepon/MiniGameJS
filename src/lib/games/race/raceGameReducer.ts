import type { RaceGameState, RaceGameAction, Lane } from './types'
import { RACE_CONSTANTS } from './constants'
import { getTargetSpeed, updateSpeed, calculateDistance } from './speedUtils'
import { spawnObstacle, updateObstacles } from './obstacleUtils'
import { filterCollidedObstacles } from './collisionUtils'

// 初期状態
export const initialRaceGameState: RaceGameState = {
  status: 'idle',
  player: {
    lane: 'normal',
    speed: 0,
    position: {
      x: RACE_CONSTANTS.NORMAL_LANE_X,
      y: RACE_CONSTANTS.PLAYER_Y,
    },
  },
  obstacles: [],
  distanceTraveled: 0,
  elapsedTime: 0,
  crashRecoveryTime: 0,
  lastObstacleSpawnTime: 0,
}

// 車線変更を処理
function changeLane(state: RaceGameState, lane: Lane): RaceGameState {
  if (state.status !== 'playing') {
    return state
  }

  const newX = lane === 'normal'
    ? RACE_CONSTANTS.NORMAL_LANE_X
    : RACE_CONSTANTS.OVERTAKING_LANE_X

  return {
    ...state,
    player: {
      ...state.player,
      lane,
      position: {
        ...state.player.position,
        x: newX,
      },
    },
  }
}

// クラッシュからの回復処理
function processRecovery(state: RaceGameState, deltaTime: number): RaceGameState {
  const newRecoveryTime = state.crashRecoveryTime - deltaTime

  if (newRecoveryTime <= 0) {
    return {
      ...state,
      status: 'playing',
      crashRecoveryTime: 0,
    }
  }

  return {
    ...state,
    elapsedTime: state.elapsedTime + deltaTime,
    crashRecoveryTime: newRecoveryTime,
  }
}

// 障害物のスポーン判定と生成
function processObstacleSpawn(
  obstacles: readonly import('./types').Obstacle[],
  currentTime: number,
  lastSpawnTime: number
): { obstacles: readonly import('./types').Obstacle[]; lastSpawnTime: number } {
  const timeSinceLastSpawn = currentTime - lastSpawnTime
  const shouldSpawn = timeSinceLastSpawn >= RACE_CONSTANTS.OBSTACLE_SPAWN_INTERVAL

  if (!shouldSpawn) {
    return { obstacles, lastSpawnTime }
  }

  const newObstacle = spawnObstacle(obstacles)
  return {
    obstacles: newObstacle ? [...obstacles, newObstacle] : obstacles,
    lastSpawnTime: currentTime,
  }
}

// プレイ中のメイン処理
function processPlayingTick(state: RaceGameState, deltaTime: number): RaceGameState {
  // 速度更新
  const targetSpeed = getTargetSpeed(state.player.lane)
  const newSpeed = updateSpeed(state.player.speed, targetSpeed, deltaTime)

  // 移動距離計算
  const distanceDelta = calculateDistance(newSpeed, deltaTime)
  const newDistance = state.distanceTraveled + distanceDelta
  const newElapsedTime = state.elapsedTime + deltaTime

  // ゴール判定
  if (newDistance >= RACE_CONSTANTS.GOAL_DISTANCE) {
    return {
      ...state,
      status: 'finished',
      player: { ...state.player, speed: newSpeed },
      distanceTraveled: RACE_CONSTANTS.GOAL_DISTANCE,
      elapsedTime: newElapsedTime,
    }
  }

  // 障害物の移動と削除を一括処理
  const movedObstacles = updateObstacles(state.obstacles, newSpeed, deltaTime)

  // 障害物のスポーン
  const { obstacles: newObstacles, lastSpawnTime: newLastSpawnTime } = processObstacleSpawn(
    movedObstacles,
    newElapsedTime,
    state.lastObstacleSpawnTime
  )

  // プレイヤー情報を更新
  const newPlayer = { ...state.player, speed: newSpeed }

  // 衝突判定（衝突した障害物は削除）
  const { hasCollision, remainingObstacles } = filterCollidedObstacles(newPlayer, newObstacles)

  if (hasCollision) {
    return {
      ...state,
      status: 'crashed',
      player: {
        ...newPlayer,
        speed: 0,
        lane: 'normal', // 衝突時は通常車線に戻す
        position: {
          ...newPlayer.position,
          x: RACE_CONSTANTS.NORMAL_LANE_X,
        },
      },
      obstacles: remainingObstacles, // 衝突した障害物を除外
      distanceTraveled: newDistance,
      elapsedTime: newElapsedTime,
      crashRecoveryTime: RACE_CONSTANTS.CRASH_RECOVERY_TIME,
      lastObstacleSpawnTime: newLastSpawnTime,
    }
  }

  return {
    ...state,
    player: newPlayer,
    obstacles: newObstacles,
    distanceTraveled: newDistance,
    elapsedTime: newElapsedTime,
    lastObstacleSpawnTime: newLastSpawnTime,
  }
}

// ゲームループのメイン処理
function processTick(state: RaceGameState, deltaTime: number): RaceGameState {
  if (state.status === 'crashed') {
    return processRecovery(state, deltaTime)
  }

  if (state.status === 'playing') {
    return processPlayingTick(state, deltaTime)
  }

  return state
}

// メインReducer
export function raceGameReducer(
  state: RaceGameState,
  action: RaceGameAction
): RaceGameState {
  switch (action.type) {
    case 'START':
      return {
        ...initialRaceGameState,
        status: 'playing',
      }

    case 'TICK':
      return processTick(state, action.deltaTime)

    case 'CHANGE_LANE':
      return changeLane(state, action.lane)

    case 'RESET':
      return initialRaceGameState

    default:
      return state
  }
}
