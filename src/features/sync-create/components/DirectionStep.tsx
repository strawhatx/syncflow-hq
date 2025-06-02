import React from 'react';

interface DirectionStepProps {
  syncDirection: 'one-way' | 'two-way';
  onDirectionChange: (direction: 'one-way' | 'two-way') => void;
  conflictResolution: 'source' | 'destination' | 'latest';
  onConflictResolutionChange: (resolution: 'source' | 'destination' | 'latest') => void;
}

const DirectionStep: React.FC<DirectionStepProps> = ({
  syncDirection,
  onDirectionChange,
  conflictResolution,
  onConflictResolutionChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <h3 className="font-medium mb-4">Sync Direction</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
            syncDirection === "one-way"
              ? "border-primary ring-1 ring-primary bg-accent"
              : "border-border hover:border-primary/40"
          }`}
          onClick={() => onDirectionChange("one-way")}
        >
          <div className="flex items-center justify-center mb-4 text-primary">
            <div className="p-2 rounded-full bg-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h4 className="font-medium text-center mb-2">One-way Sync</h4>
          <p className="text-sm text-muted-foreground text-center">
            Data syncs from source to destination only
          </p>
        </div>
        
        <div 
          className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
            syncDirection === "two-way"
              ? "border-primary ring-1 ring-primary bg-accent"
              : "border-border hover:border-primary/40"
          }`}
          onClick={() => onDirectionChange("two-way")}
        >
          <div className="flex items-center justify-center mb-4 text-primary">
            <div className="p-2 rounded-full bg-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8L21 12M21 12L17 16M21 12H3M7 16L3 12M3 12L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h4 className="font-medium text-center mb-2">Two-way Sync</h4>
          <p className="text-sm text-muted-foreground text-center">
            Data syncs in both directions with conflict resolution
          </p>
        </div>
      </div>
      
      {syncDirection === 'two-way' && (
        <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
          <h4 className="font-medium mb-2">Conflict Resolution</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Choose how to handle conflicting changes when the same record is modified in both systems.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input 
                type="radio" 
                id="source" 
                name="conflict" 
                className="mr-2"
                checked={conflictResolution === 'source'}
                onChange={() => onConflictResolutionChange('source')}
              />
              <label htmlFor="source" className="text-sm">Source wins (Source takes precedence)</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="destination" 
                name="conflict" 
                className="mr-2"
                checked={conflictResolution === 'destination'}
                onChange={() => onConflictResolutionChange('destination')}
              />
              <label htmlFor="destination" className="text-sm">Destination wins (Destination takes precedence)</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="latest" 
                name="conflict" 
                className="mr-2"
                checked={conflictResolution === 'latest'}
                onChange={() => onConflictResolutionChange('latest')}
              />
              <label htmlFor="latest" className="text-sm">Latest change wins (Based on timestamp)</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectionStep; 