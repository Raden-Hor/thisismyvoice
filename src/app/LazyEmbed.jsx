import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';

export default function LazyEmbed({ src, contentType, ratio = '4:3' }) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px',
    });

    const [loaded, setLoaded] = useState(false);

    const [width, height] = ratio.split(':').map(Number);
    const paddingBottom = `${(height / width) * 100}%`;

    const isImage = contentType?.startsWith('image');


    return (
        <div
            ref={ref}
            style={{
                position: 'relative',
                width: '100%',
                paddingBottom,
                backgroundColor: '#eee',
                overflow: 'hidden',
            }}
        >
            {inView && (
                isImage ? (
                    <img
                        src={src}
                        alt=""
                        onLoad={() => setLoaded(true)}
                        loading="lazy"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                ) : (
                    <iframe
                        src={src}
                        onLoad={() => setLoaded(true)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                        }}
                        allowFullScreen
                        loading="lazy"
                    />
                )
            )}

            {!loaded && (
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
        </div>
    );
}
