import React, { useState, useRef, useMemo } from 'react';
import { SearchIcon } from './Icons';

const GLOBE_RADIUS = 250; // in pixels
const EARTH_TEXTURE_URL = 'https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg';

const AURA_CATEGORIES = [
  { key: 'all', name: 'All', color: 'rgba(74, 222, 128, 0.8)' },
  { key: 'tech', name: 'Tech', color: 'rgba(59, 130, 246, 0.8)' },
  { key: 'music', name: 'Music', color: 'rgba(168, 85, 247, 0.8)' },
  { key: 'comedy', name: 'Comedy', color: 'rgba(234, 179, 8, 0.8)' },
  { key: 'wellness', name: 'Wellness', color: 'rgba(34, 197, 94, 0.8)' },
  { key: 'art', name: 'Art', color: 'rgba(236, 72, 153, 0.8)' },
  { key: 'gaming', name: 'Gaming', color: 'rgba(249, 115, 22, 0.8)' },
  { key: 'travel', name: 'Travel', color: 'rgba(20, 184, 166, 0.8)' },
];

// Mock data source updated with categories
const mockGlobalContent = [
  { lat: 34.0522, lng: -118.2437, value: 0.9, category: 'art' }, // Los Angeles
  { lat: 40.7128, lng: -74.0060, value: 1.0, category: 'music' },  // New York City
  { lat: 51.5072, lng: -0.1276, value: 0.95, category: 'tech' }, // London
  { lat: 48.8566, lng: 2.3522, value: 0.8, category: 'art' },   // Paris
  { lat: 35.6762, lng: 139.6503, value: 0.85, category: 'gaming' }, // Tokyo
  { lat: -33.8688, lng: 151.2093, value: 0.7, category: 'travel' }, // Sydney
  { lat: 19.4326, lng: -99.1332, value: 0.6, category: 'music' }, // Mexico City
  { lat: -23.5505, lng: -46.6333, value: 0.75, category: 'comedy' },// São Paulo
  { lat: 55.7558, lng: 37.6173, value: 0.5, category: 'tech' },  // Moscow
  { lat: 39.9042, lng: 116.4074, value: 0.8, category: 'gaming' }, // Beijing
  { lat: 19.0760, lng: 72.8777, value: 0.7, category: 'wellness' },  // Mumbai
  { lat: 30.0444, lng: 31.2357, value: 0.4, category: 'travel' },  // Cairo
  { lat: -26.2041, lng: 28.0473, value: 0.5, category: 'wellness' }, // Johannesburg
  { lat: 41.9028, lng: 12.4964, value: 0.6, category: 'art' },  // Rome
  { lat: 52.5200, lng: 13.4050, value: 0.7, category: 'tech' },  // Berlin
  { lat: -34.6037, lng: -58.3816, value: 0.65, category: 'comedy' },// Buenos Aires
  { lat: 37.7749, lng: -122.4194, value: 0.8, category: 'tech' }, // San Francisco
  { lat: 45.4215, lng: -75.6972, value: 0.4, category: 'gaming' },  // Ottawa
  { lat: 1.3521, lng: 103.8198, value: 0.7, category: 'travel' },  // Singapore
  { lat: 37.5665, lng: 126.9780, value: 0.75, category: 'music' }, // Seoul
  { lat: 28.6139, lng: 77.2090, value: 0.6, category: 'wellness' },  // New Delhi
  { lat: 4.7110, lng: -74.0721, value: 0.5, category: 'comedy' },   // Bogotá
  { lat: 34.7963, lng: 113.6548, value: 0.2, category: 'tech' },  // Zhengzhou
  { lat: 60.1699, lng: 24.9384, value: 0.3, category: 'wellness' },  // Helsinki
  { lat: -1.2921, lng: 36.8219, value: 0.4, category: 'travel' },  // Nairobi
  { lat: 31.2304, lng: 121.4737, value: 0.9, category: 'music' }, // Shanghai
  { lat: 25.276987, lng: 55.296249, value: 0.6, category: 'art' } // Dubai
];


// Utility to convert Latitude/Longitude to 3D Cartesian coordinates
const latLngToCartesian = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return { x, y, z };
};

interface AuraSphereViewProps {
    onSearchClick?: () => void;
}

const AuraSphereView: React.FC<AuraSphereViewProps> = ({ onSearchClick }) => {
    const [rotation, setRotation] = useState({ x: 10, y: -90 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const lastPos = useRef({ x: 0, y: 0 });

    const handleDragStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        lastPos.current = { x: clientX, y: clientY };
    };

    const handleDragMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        const dx = clientX - lastPos.current.x;
        const dy = clientY - lastPos.current.y;
        setRotation(prev => ({
            x: Math.max(-90, Math.min(90, prev.x - dy * 0.2)), // Clamp vertical rotation
            y: prev.y + dx * 0.2
        }));
        lastPos.current = { x: clientX, y: clientY };
    };

    const handleDragEnd = () => setIsDragging(false);

    // Mouse handlers
    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    
    // Zoom handler
    const handleWheel = (e: React.WheelEvent) => {
        setZoom(prev => Math.max(0.6, Math.min(2.5, prev - e.deltaY * 0.001)));
    };


    const degToRad = (deg: number) => deg * (Math.PI / 180);
    const rotXRad = degToRad(rotation.x);
    const rotYRad = degToRad(rotation.y);
    
    const filteredContent = useMemo(() => {
        if (activeFilter === 'all') {
            return mockGlobalContent;
        }
        return mockGlobalContent.filter(point => point.category === activeFilter);
    }, [activeFilter]);
    
    const getPointColor = (point: typeof mockGlobalContent[0]) => {
        const categoryDetails = AURA_CATEGORIES.find(c => c.key === (activeFilter === 'all' ? point.category : activeFilter));
        const baseColor = categoryDetails ? categoryDetails.color : AURA_CATEGORIES[0].color;
        
        const colorWithOpacity = baseColor.replace(/,\s*\d(\.\d+)?\)/, `, ${0.8 * point.value})`);
        const transparentColor = baseColor.replace(/,\s*\d(\.\d+)?\)/, ', 0)');
        
        return { colorWithOpacity, transparentColor };
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 overflow-hidden relative select-none">
            <header className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 flex justify-between items-start z-10">
                <div className="text-left">
                    <h1 className="text-3xl md:text-4xl font-bold">AuraSphere</h1>
                    <p className="text-gray-400 mt-1 text-sm md:text-base">Drag the globe to explore global activity.</p>
                </div>
                 {onSearchClick && (
                    <button
                        onClick={onSearchClick}
                        className="p-3 text-gray-300 hover:text-white bg-gray-800/50 rounded-full backdrop-blur-sm"
                        aria-label="Search"
                    >
                        <SearchIcon className="w-6 h-6"/>
                    </button>
                 )}
            </header>

             {/* Aura Filter Pills */}
            <div className="absolute top-24 md:top-28 left-0 right-0 z-10">
                <div className="flex items-center space-x-2 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-2">
                    {AURA_CATEGORIES.map(category => {
                        const isActive = activeFilter === category.key;
                        const color = category.color.replace(/, 0.8\)/, ')'); // Get solid color for active pill bg
                        return (
                            <button
                                key={category.key}
                                onClick={() => setActiveFilter(category.key)}
                                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                                    isActive
                                        ? `text-white shadow-lg`
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 backdrop-blur-sm'
                                }`}
                                style={{
                                    backgroundColor: isActive ? color : undefined,
                                }}
                            >
                                {category.name}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div
                id="globe-container"
                className="relative cursor-grab active:cursor-grabbing"
                style={{ width: `${GLOBE_RADIUS * 2}px`, height: `${GLOBE_RADIUS * 2}px` }}
                onMouseDown={handleMouseDown}
                onMouseMove={isDragging ? handleMouseMove : undefined}
                onMouseUp={handleDragEnd}
                onMouseLeave={isDragging ? handleDragEnd : undefined}
                onTouchStart={handleTouchStart}
                onTouchMove={isDragging ? handleTouchMove : undefined}
                onTouchEnd={handleDragEnd}
                onWheel={handleWheel}
            >
                <div 
                    className="absolute inset-0 rounded-full border-2 border-blue-500/20 shadow-2xl shadow-black"
                     style={{
                        backgroundImage: `url(${EARTH_TEXTURE_URL})`,
                        backgroundSize: '200% 100%',
                        backgroundPositionX: `${-rotation.y * 2.77}px`,
                        willChange: 'transform, background-position',
                        transform: `scale(${zoom})`,
                        transition: 'transform 0.2s ease-out'
                    }}
                />
                
                {/* Heatmap Layer */}
                <div className="absolute inset-0 heat-point-container" style={{ filter: 'blur(12px) contrast(15)', transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out'}}>
                    {filteredContent.map((point, i) => {
                        const { x, y, z } = latLngToCartesian(point.lat, point.lng, GLOBE_RADIUS);
                        const { colorWithOpacity, transparentColor } = getPointColor(point);
                        let rotatedX = x * Math.cos(rotYRad) - z * Math.sin(rotYRad);
                        let rotatedZ = x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
                        let rotatedY = y;
                        const tempY = rotatedY;
                        rotatedY = tempY * Math.cos(rotXRad) - rotatedZ * Math.sin(rotXRad);
                        rotatedZ = tempY * Math.sin(rotXRad) + rotatedZ * Math.cos(rotXRad);
                        const isVisible = rotatedZ > -GLOBE_RADIUS * 0.2;
                        const scale = (rotatedZ + GLOBE_RADIUS) / (2 * GLOBE_RADIUS);

                        return (
                            <div
                                key={`${i}-heat`}
                                className="heat-point"
                                style={{
                                    left: `${rotatedX + GLOBE_RADIUS}px`,
                                    top: `${rotatedY + GLOBE_RADIUS}px`,
                                    opacity: isVisible ? scale : 0,
                                    transform: `translate(-50%, -50%) scale(${scale * 1.2})`,
                                    background: `radial-gradient(circle, ${colorWithOpacity} 0%, ${transparentColor} 60%)`,
                                    transition: 'opacity 0.2s, background 0.3s',
                                }}
                            />
                        );
                    })}
                </div>
                
                {/* Pins Layer */}
                <div className="absolute inset-0 pin-container" style={{transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out'}}>
                     {filteredContent.map((point, i) => {
                        const { x, y, z } = latLngToCartesian(point.lat, point.lng, GLOBE_RADIUS);
                        let rotatedX = x * Math.cos(rotYRad) - z * Math.sin(rotYRad);
                        let rotatedZ = x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
                        let rotatedY = y;
                        const tempY = rotatedY;
                        rotatedY = tempY * Math.cos(rotXRad) - rotatedZ * Math.sin(rotXRad);
                        rotatedZ = tempY * Math.sin(rotXRad) + rotatedZ * Math.cos(rotXRad);
                        const isVisible = rotatedZ > -GLOBE_RADIUS * 0.2;
                        const scale = (rotatedZ + GLOBE_RADIUS) / (2 * GLOBE_RADIUS);

                        return (
                            <div
                                key={`${i}-pin`}
                                className="pin"
                                style={{
                                    position: 'absolute',
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(255, 255, 255, 0.9)',
                                    left: `${rotatedX + GLOBE_RADIUS}px`,
                                    top: `${rotatedY + GLOBE_RADIUS}px`,
                                    opacity: isVisible ? scale : 0,
                                    transform: `translate(-50%, -50%) scale(${scale})`,
                                    transition: 'opacity 0.2s',
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AuraSphereView;
