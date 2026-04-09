import React from 'react';
import './CardSkeleton.css';

const CardSkeleton = () => {
    return (
        <div className="card-skel-wrapper glass-panel">
            <div className="card-skel-media pulse shimmer-bg"></div>
            <div className="card-skel-body">
                <div className="card-skel-title pulse shimmer-bg"></div>
                <div className="card-skel-price pulse shimmer-bg"></div>
                <div className="card-skel-specs">
                    <div className="skel-spec pulse shimmer-bg"></div>
                    <div className="skel-spec pulse shimmer-bg"></div>
                    <div className="skel-spec pulse shimmer-bg"></div>
                </div>
                <div className="card-skel-footer pulse shimmer-bg"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
