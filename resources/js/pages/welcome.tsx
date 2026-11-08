import { Head } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpRight,
    CircleHelp,
    Maximize2,
    Minimize2,
    Moon,
    Play,
    RotateCcw,
    Sparkles,
    Sun,
    Trophy,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import '../../css/moon-runner.css';

type GameStatus = 'ready' | 'playing' | 'over';
type Obstacle = {
    id: number;
    x: number;
    width: number;
    height: number;
    shape: 'crystal' | 'rock' | 'spike' | 'cactus';
};

const BIOMES = [
    { name: 'LUNAR MEADOW', className: 'meadow' },
    { name: 'AMBER CRATER', className: 'crater' },
    { name: 'VIOLET SKY', className: 'violet' },
] as const;
const OBSTACLE_SHAPES = ['crystal', 'rock', 'spike', 'cactus'] as const;
const PLAYER_HITBOX_WIDTH = 30;
const PLAYER_HITBOX_HEIGHT = 63;
const PLAYER_LEFT_RATIO = 0.13;
const GRAVITY = 1850;
const JUMP_POWER = 680;

function RunnerSprite() {
    return (
        <svg
            aria-hidden="true"
            className="runner-sprite"
            viewBox="0 0 64 72"
            fill="none"
        >
            <ellipse
                cx="32"
                cy="68"
                rx="20"
                ry="3"
                fill="#19273B"
                opacity=".14"
            />
            <path
                d="M17 43.5c0-7.5 6-13.5 13.5-13.5h3c7.5 0 13.5 6 13.5 13.5V60H17V43.5Z"
                fill="#F9F8F1"
                stroke="#23344A"
                strokeWidth="2.5"
            />
            <path d="M19 54h26v7H19z" fill="#D9E7DD" />
            <path
                d="M15 43c0-2 1.6-3.5 3.5-3.5S22 41 22 43v11h-7V43ZM42 43c0-2 1.6-3.5 3.5-3.5S49 41 49 43v11h-7V43Z"
                fill="#F4B269"
                stroke="#23344A"
                strokeWidth="2.5"
            />
            <path
                d="M21 59h9v8h-9zM34 59h9v8h-9z"
                fill="#F4B269"
                stroke="#23344A"
                strokeWidth="2.5"
            />
            <path
                d="M19 65h12v4H18c-1.1 0-2-.9-2-2s.9-2 2-2ZM32 65h12c1.1 0 2 .9 2 2s-.9 2-2 2H32v-4Z"
                fill="#23344A"
            />
            <circle
                cx="32"
                cy="19"
                r="15"
                fill="#FBFAF4"
                stroke="#23344A"
                strokeWidth="2.5"
            />
            <path
                d="M23 18.5c0-5.2 4.2-9.5 9.5-9.5h5.3c2.4 0 4.3 1.9 4.3 4.3v6.2c0 3-2.4 5.5-5.5 5.5h-9c-2.5 0-4.6-2-4.6-4.6v-1.9Z"
                fill="#B5D9D4"
            />
            <path
                d="M25 14c1.5-2 3.6-3.2 6-3.6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <circle cx="35" cy="18" r="1.5" fill="#23344A" />
            <path
                d="M31.5 24c1.7 1.3 3.7 1.6 5.5.8"
                stroke="#23344A"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M31.5 4v-2M19.2 9l-1.4-1.4M44.8 9l1.4-1.4"
                stroke="#F4B269"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ObstacleSprite({ obstacle }: { obstacle: Obstacle }) {
    return (
        <div
            aria-hidden="true"
            className={`runner-obstacle runner-obstacle--${obstacle.shape}`}
            style={{
                height: obstacle.height,
                left: obstacle.x,
                width: obstacle.width,
            }}
        >
            {obstacle.shape === 'crystal' && (
                <svg viewBox="0 0 40 56" preserveAspectRatio="none">
                    <path
                        d="M3 53 7 28 17 2l9 23 10 28H3Z"
                        fill="#F4B269"
                        stroke="#23344A"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="m17 2 3 51M7 28h23"
                        stroke="#D98952"
                        strokeWidth="2"
                    />
                    <path d="m17 2 4 25-8 7Z" fill="#FFD49B" />
                </svg>
            )}
            {obstacle.shape === 'rock' && (
                <svg viewBox="0 0 48 42" preserveAspectRatio="none">
                    <path
                        d="m3 39 3-17L17 5l8 9 10-7 10 19 1 13H3Z"
                        fill="#8EAFA2"
                        stroke="#23344A"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="m17 5 4 16 13-14M6 22l13-1 6 18"
                        stroke="#73988A"
                        strokeWidth="2"
                    />
                    <circle cx="32" cy="27" r="2" fill="#D7E4D9" />
                </svg>
            )}
            {obstacle.shape === 'spike' && (
                <svg viewBox="0 0 38 56" preserveAspectRatio="none">
                    <path
                        d="M3 53V28l8 7V14l9 9 8-20 7 50H3Z"
                        fill="#E58869"
                        stroke="#23344A"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="m20 23 2 30M11 35l4-7M28 34l5-8"
                        stroke="#D36B55"
                        strokeWidth="2"
                    />
                </svg>
            )}
            {obstacle.shape === 'cactus' && (
                <svg viewBox="0 0 42 54" preserveAspectRatio="none">
                    <path
                        d="M13 52V34H9c-3 0-5-2-5-5v-7h6v5h3V12c0-5 3-9 8-9s8 4 8 9v9h3v-6h6v9c0 3-2 5-5 5h-4v18H13Z"
                        fill="#7E9E78"
                        stroke="#23344A"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M18 14v4m9-2v5M18 32v5"
                        stroke="#B6C7A1"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </div>
    );
}

function formatScore(value: number) {
    return Math.floor(value).toString().padStart(5, '0');
}

export default function Welcome() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [status, setStatus] = useState<GameStatus>('ready');
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [playerBottom, setPlayerBottom] = useState(0);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [storageUnavailable, setStorageUnavailable] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenError, setFullscreenError] = useState('');
    const gameCardRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<GameStatus>('ready');
    const playerBottomRef = useRef(0);
    const verticalVelocityRef = useRef(0);
    const obstaclesRef = useRef<Obstacle[]>([]);
    const elapsedRef = useRef(0);
    const nextObstacleIdRef = useRef(0);
    const actionRef = useRef<() => void>(() => undefined);

    statusRef.current = status;
    const biome = BIOMES[Math.floor(score / 120) % BIOMES.length];
    const themeToggleLabel =
        resolvedAppearance === 'dark'
            ? 'Switch to light mode'
            : 'Switch to dark mode';

    useEffect(() => {
        const syncFullscreenState = () => {
            setIsFullscreen(document.fullscreenElement === gameCardRef.current);
        };

        document.addEventListener('fullscreenchange', syncFullscreenState);
        return () =>
            document.removeEventListener(
                'fullscreenchange',
                syncFullscreenState,
            );
    }, []);

    const toggleFullscreen = useCallback(async () => {
        const gameCard = gameCardRef.current;
        if (!gameCard) {
            return;
        }

        setFullscreenError('');

        try {
            if (document.fullscreenElement === gameCard) {
                await document.exitFullscreen();
            } else {
                await gameCard.requestFullscreen();
            }
        } catch {
            setFullscreenError(
                'Fullscreen is unavailable in this browser or window.',
            );
        }
    }, []);

    useEffect(() => {
        try {
            const savedBest = window.localStorage.getItem('moon-runner-best');
            if (savedBest !== null) {
                const parsedBest = Number(savedBest);
                if (Number.isFinite(parsedBest) && parsedBest >= 0) {
                    setBestScore(parsedBest);
                }
            }
        } catch {
            setStorageUnavailable(true);
        }
    }, []);

    const finishRun = useCallback((finalScore: number) => {
        statusRef.current = 'over';
        setStatus('over');
        setScore(finalScore);
        setBestScore((currentBest) => {
            const nextBest = Math.max(currentBest, finalScore);
            try {
                window.localStorage.setItem(
                    'moon-runner-best',
                    String(nextBest),
                );
            } catch {
                setStorageUnavailable(true);
            }
            return nextBest;
        });
    }, []);

    const handleAction = useCallback(() => {
        if (statusRef.current === 'ready' || statusRef.current === 'over') {
            playerBottomRef.current = 0;
            verticalVelocityRef.current = 0;
            obstaclesRef.current = [];
            elapsedRef.current = 0;
            setPlayerBottom(0);
            setObstacles([]);
            setScore(0);
            statusRef.current = 'playing';
            setStatus('playing');
            return;
        }

        if (playerBottomRef.current <= 1) {
            verticalVelocityRef.current = -JUMP_POWER;
        }
    }, []);

    actionRef.current = handleAction;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.code === 'Space' ||
                event.code === 'ArrowUp' ||
                event.code === 'KeyW'
            ) {
                if (
                    stageRef.current?.contains(event.target as Node) ||
                    (event.target instanceof HTMLElement &&
                        event.target.closest(
                            'button, a, input, textarea, select, [contenteditable="true"]',
                        ))
                ) {
                    return;
                }
                event.preventDefault();
                actionRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (status !== 'playing') {
            return;
        }

        let frameId = 0;
        let previousTime = 0;
        let spawnTimer = 0.9;
        let scoreTimer = 0;

        const tick = (now: number) => {
            const delta =
                previousTime === 0
                    ? 0
                    : Math.min((now - previousTime) / 1000, 0.04);
            previousTime = now;
            elapsedRef.current += delta;
            scoreTimer += delta;

            const currentScore = Math.floor(elapsedRef.current * 10);
            const stageWidth = stageRef.current?.clientWidth ?? 800;
            const speed = Math.min(330 + currentScore * 0.075, 520);
            const playerCenter = stageWidth * PLAYER_LEFT_RATIO;
            const groundHeight = 24;

            if (
                playerBottomRef.current > 0 ||
                verticalVelocityRef.current < 0
            ) {
                verticalVelocityRef.current += GRAVITY * delta;
                playerBottomRef.current = Math.max(
                    0,
                    playerBottomRef.current -
                        verticalVelocityRef.current * delta,
                );
                if (playerBottomRef.current === 0) {
                    verticalVelocityRef.current = 0;
                }
                setPlayerBottom(playerBottomRef.current);
            }

            spawnTimer -= delta;
            if (spawnTimer <= 0) {
                const shape =
                    OBSTACLE_SHAPES[
                        Math.floor(Math.random() * OBSTACLE_SHAPES.length)
                    ];
                const dimensions =
                    shape === 'rock'
                        ? {
                              width: 40 + Math.random() * 18,
                              height: 34 + Math.random() * 15,
                          }
                        : shape === 'spike'
                          ? { width: 38, height: 54 }
                          : shape === 'cactus'
                            ? { width: 34, height: 49 }
                            : {
                                  width: 34 + Math.random() * 12,
                                  height: 45 + Math.random() * 13,
                              };
                obstaclesRef.current.push({
                    id: nextObstacleIdRef.current++,
                    x: stageWidth + 16,
                    ...dimensions,
                    shape,
                });
                spawnTimer = 1.25 + Math.random() * 0.65;
            }

            const nextObstacles = obstaclesRef.current
                .map((obstacle) => ({
                    ...obstacle,
                    x: obstacle.x - speed * delta,
                }))
                .filter((obstacle) => obstacle.x + obstacle.width > -10);

            const playerLeft = playerCenter - PLAYER_HITBOX_WIDTH / 2;
            const playerRight = playerCenter + PLAYER_HITBOX_WIDTH / 2;
            const playerFoot = groundHeight + playerBottomRef.current + 2;
            const playerTop = playerFoot + PLAYER_HITBOX_HEIGHT;
            const collision = nextObstacles.some((obstacle) => {
                const overlapsHorizontally =
                    obstacle.x < playerRight &&
                    obstacle.x + obstacle.width > playerLeft;
                const obstacleTop = groundHeight + obstacle.height;
                const overlapsVertically =
                    playerFoot < obstacleTop - 4 && playerTop > groundHeight;
                return overlapsHorizontally && overlapsVertically;
            });

            obstaclesRef.current = nextObstacles;
            setObstacles(nextObstacles);

            if (scoreTimer >= 0.08) {
                setScore(currentScore);
                scoreTimer = 0;
            }

            if (collision) {
                finishRun(currentScore);
                return;
            }

            frameId = window.requestAnimationFrame(tick);
        };

        frameId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(frameId);
    }, [finishRun, status]);

    const buttonLabel =
        status === 'ready'
            ? 'Start your run'
            : status === 'over'
              ? 'Run it back'
              : 'Jump';
    const statusLabel =
        status === 'ready'
            ? 'Your next great adventure starts with one jump.'
            : status === 'over'
              ? 'The moon can wait. Ready for another go?'
              : 'Nice and easy. Tap jump when the path gets rocky.';

    return (
        <>
            <Head title="Moon Runner" />
            <main className="runner-page">
                <header className="runner-topbar">
                    <a
                        className="runner-brand"
                        href="/"
                        aria-label="Moonbase Arcade home"
                    >
                        <span className="runner-brand-mark">
                            <Sparkles size={18} strokeWidth={2.2} />
                        </span>
                        <span>
                            moonbase
                            <span className="runner-brand-light"> arcade</span>
                        </span>
                    </a>
                    <div className="runner-topbar-meta">
                        <span className="runner-live-dot" />
                        <span>ARCADE 01</span>
                        <span className="runner-topbar-divider" />
                        <span>ENDLESS MODE</span>
                    </div>
                    <div className="runner-topbar-actions">
                        <button
                            type="button"
                            className="runner-theme-button"
                            onClick={() =>
                                updateAppearance(
                                    resolvedAppearance === 'dark'
                                        ? 'light'
                                        : 'dark',
                                )
                            }
                            aria-label={themeToggleLabel}
                            title={themeToggleLabel}
                            aria-pressed={resolvedAppearance === 'dark'}
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun size={17} />
                            ) : (
                                <Moon size={17} />
                            )}
                        </button>
                        <a className="runner-about-link" href="#how-to-play">
                            How to play <ArrowUpRight size={15} />
                        </a>
                    </div>
                </header>

                <section className="runner-content">
                    <div className="runner-intro">
                        <div className="runner-eyebrow">
                            <span>01</span> THE LUNAR RUN
                        </div>
                        <h1>
                            Small steps.
                            <br />
                            <span>Big orbit.</span>
                        </h1>
                        <p className="runner-intro-copy">
                            One curious little explorer. An endless stretch of
                            moon dust. How far can you make it?
                        </p>

                        <div className="runner-stats">
                            <div className="runner-stat">
                                <span className="runner-stat-icon">
                                    <Trophy size={17} />
                                </span>
                                <span className="runner-stat-label">
                                    PERSONAL BEST
                                </span>
                                <strong>
                                    {formatScore(bestScore)} <small>m</small>
                                </strong>
                            </div>
                            <div className="runner-stat-rule" />
                            <div className="runner-stat">
                                <span className="runner-stat-icon runner-stat-icon--mint">
                                    <Sparkles size={17} />
                                </span>
                                <span className="runner-stat-label">
                                    THIS RUN
                                </span>
                                <strong>
                                    {formatScore(score)} <small>m</small>
                                </strong>
                            </div>
                        </div>

                        <div className="runner-howto" id="how-to-play">
                            <div className="runner-howto-heading">
                                <CircleHelp size={17} /> HOW TO PLAY
                            </div>
                            <div className="runner-instruction">
                                <span className="runner-key">
                                    <ArrowUp size={15} />
                                    <span>SPACE</span>
                                </span>
                                <span>Jump over the moon rocks</span>
                            </div>
                            <div className="runner-instruction">
                                <span className="runner-key runner-key--wide">
                                    <ArrowDown size={15} />
                                    <span>TAP</span>
                                </span>
                                <span>Tap anywhere to leap</span>
                            </div>
                        </div>
                    </div>

                    <section
                        ref={gameCardRef}
                        className="runner-game-card"
                        aria-label="Moon Runner game"
                    >
                        <div className="runner-card-header">
                            <div className="runner-card-title">
                                <span className="runner-card-kicker">
                                    MISSION CONTROL
                                </span>
                                <strong>Moon Runner</strong>
                            </div>
                            <div className="runner-scoreboard">
                                <div>
                                    <span>BEST</span>
                                    <strong>{formatScore(bestScore)}</strong>
                                </div>
                                <div className="runner-score-divider" />
                                <div>
                                    <span>DISTANCE</span>
                                    <strong>{formatScore(score)}</strong>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="runner-fullscreen-button"
                                onClick={toggleFullscreen}
                                aria-label={
                                    isFullscreen
                                        ? 'Exit fullscreen'
                                        : 'Enter fullscreen'
                                }
                                aria-pressed={isFullscreen}
                                title={
                                    isFullscreen
                                        ? 'Exit fullscreen'
                                        : 'Enter fullscreen'
                                }
                            >
                                {isFullscreen ? (
                                    <Minimize2 size={17} />
                                ) : (
                                    <Maximize2 size={17} />
                                )}
                            </button>
                        </div>

                        <div
                            ref={stageRef}
                            className={`runner-stage runner-stage--${status} runner-stage--biome-${biome.className}`}
                            data-biome={biome.name}
                            role="button"
                            tabIndex={0}
                            aria-label="Game area. Press Space or Arrow Up to jump."
                            onPointerDown={(event) => {
                                event.preventDefault();
                                actionRef.current();
                            }}
                            onKeyDown={(event) => {
                                if (
                                    event.code === 'Space' ||
                                    event.code === 'ArrowUp'
                                ) {
                                    event.preventDefault();
                                    actionRef.current();
                                }
                            }}
                        >
                            <div className="runner-stars runner-stars--one" />
                            <div className="runner-stars runner-stars--two" />
                            <div className="runner-moon" />
                            <div className="runner-orbit runner-orbit--one" />
                            <div className="runner-orbit runner-orbit--two" />
                            <span className="runner-spark runner-spark--one">
                                ✳
                            </span>
                            <span className="runner-spark runner-spark--two">
                                ·
                            </span>
                            <span className="runner-spark runner-spark--three">
                                ✦
                            </span>
                            <div className="runner-stage-caption">
                                <span className="runner-caption-dot" />
                                <span>
                                    {status === 'playing'
                                        ? 'IN FLIGHT'
                                        : status === 'over'
                                          ? 'MISSION ENDED'
                                          : 'ALL SYSTEMS READY'}
                                </span>
                            </div>

                            {status !== 'playing' && (
                                <div className="runner-stage-prompt">
                                    <span className="runner-prompt-icon">
                                        {status === 'over' ? (
                                            <RotateCcw size={17} />
                                        ) : (
                                            <Play
                                                size={17}
                                                fill="currentColor"
                                            />
                                        )}
                                    </span>
                                    <span>
                                        {status === 'over'
                                            ? 'One more orbit?'
                                            : 'Ready when you are'}
                                    </span>
                                </div>
                            )}

                            <div
                                className={`runner-player${playerBottom > 1 ? ' runner-player--airborne' : ''}`}
                                style={{
                                    bottom: `${24 + playerBottom}px`,
                                    left: `${PLAYER_LEFT_RATIO * 100}%`,
                                }}
                            >
                                <RunnerSprite />
                            </div>
                            {obstacles.map((obstacle) => (
                                <ObstacleSprite
                                    key={obstacle.id}
                                    obstacle={obstacle}
                                />
                            ))}
                            <div className="runner-ground" />
                            <div className="runner-ground-line" />
                        </div>

                        <div className="runner-card-footer">
                            <div className="runner-game-message" role="status">
                                <span
                                    className={`runner-message-indicator runner-message-indicator--${status}`}
                                />
                                <span>{statusLabel}</span>
                            </div>
                            <button
                                type="button"
                                className={`runner-action runner-action--${status}`}
                                onClick={handleAction}
                                aria-label={buttonLabel}
                            >
                                {status === 'playing' ? (
                                    <ArrowUp size={17} />
                                ) : status === 'over' ? (
                                    <RotateCcw size={16} />
                                ) : (
                                    <Play size={16} fill="currentColor" />
                                )}
                                <span>{buttonLabel}</span>
                                {status === 'ready' && (
                                    <span className="runner-button-key">
                                        SPACE
                                    </span>
                                )}
                            </button>
                        </div>
                        {fullscreenError && (
                            <p className="runner-fullscreen-error" role="alert">
                                {fullscreenError}
                            </p>
                        )}
                        {storageUnavailable && (
                            <p className="runner-storage-note">
                                Your best score is only saved for this visit
                                because browser storage is unavailable.
                            </p>
                        )}
                    </section>
                </section>

                <footer className="runner-footer">
                    <span>MADE FOR THE LONG WAY HOME</span>
                    <span className="runner-footer-center">
                        <span /> KEEP YOUR EYES ON THE HORIZON
                    </span>
                    <span>
                        MOONBASE ARCADE{' '}
                        <span className="runner-footer-year">© 2026</span>
                    </span>
                </footer>
            </main>
        </>
    );
}
