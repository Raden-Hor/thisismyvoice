import { useInView } from 'react-intersection-observer';
import { useState, useEffect, useMemo } from 'react';

export default function LazyEmbed({ src, contentType, ratio = '16:9' }) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '300px', // Increased for better mobile experience
        threshold: 0.1,
    });

    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Memoize aspect ratio calculation
    const paddingBottom = useMemo(() => {
        const [width, height] = ratio.split(':').map(Number);
        return `${(height / width) * 100}%`;
    }, [ratio]);

    const isImage = contentType?.startsWith('image');
    const isVideo = contentType?.startsWith('video');

    // Reset states when src changes
    useEffect(() => {
        setLoaded(false);
        setError(false);
        setRetryCount(0);
    }, [src]);

    const handleLoad = () => {
        setLoaded(true);
        setError(false);
    };

    const handleError = () => {
        if (retryCount < 2) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
                setError(false);
            }, 1000 + retryCount * 1000); // Progressive retry delay
        } else {
            setError(true);
        }
    };

    const handleRetry = () => {
        setError(false);
        setRetryCount(0);
        setLoaded(false);
    };

    return (
        <div
            ref={ref}
            style={{
                position: 'relative',
                width: '100%',
                paddingBottom,
                backgroundColor: '#f5f5f5',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
        >
            {inView && !error && (
                <>
                    {isImage ? (
                        <img
                            src={src}
                            alt=""
                            onLoad={handleLoad}
                            onError={handleError}
                            loading="lazy"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'opacity 0.3s ease',
                                opacity: loaded ? 1 : 0,
                            }}
                        />
                    ) : isVideo ? (
                        <video
                            src={src}
                            controls
                            preload="metadata" // Only load metadata initially
                            onLoadedData={handleLoad}
                            onError={handleError}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#000',
                                transition: 'opacity 0.3s ease',
                                opacity: loaded ? 1 : 0,
                            }}
                        />
                    ) : (
                        // For other content types, use iframe with optimizations
                        <iframe
                            src={src}
                            onLoad={handleLoad}
                            onError={handleError}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 0,
                                transition: 'opacity 0.3s ease',
                                opacity: loaded ? 1 : 0,
                            }}
                            allowFullScreen
                            loading="lazy"
                            // Disable some features for better performance
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    )}
                </>
            )}

            {/* Loading placeholder */}
            {(!loaded || !inView) && !error && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: inView ? 'shimmer 1.5s infinite' : 'none',
                    }}
                >
                    <div style={{
                        color: '#999',
                        fontSize: '14px',
                        textAlign: 'center',
                        padding: '20px',
                    }}>
                        {!inView ? 'Scroll to load' : 'Loading...'}
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ffebee',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ color: '#d32f2f', marginBottom: '10px', fontSize: '24px' }}>
                        ⚠️
                    </div>
                    <div style={{ color: '#d32f2f', marginBottom: '15px', fontSize: '14px' }}>
                        Failed to load content
                    </div>
                    <button
                        onClick={handleRetry}
                        style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Loading indicator for mobile */}
            {inView && !loaded && !error && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            width: '30px',
                            height: '30px',
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #2196F3',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                </div>
            )}

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}