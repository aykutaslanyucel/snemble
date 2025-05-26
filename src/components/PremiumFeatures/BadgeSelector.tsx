
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BadgeData } from "@/types/BadgeTypes";
import { useAuth } from "@/contexts/AuthContext";

interface BadgeSelectorProps {
  selectedBadge?: string;
  onSelectBadge: (badgeUrl: string) => void;
  onPositionChange: (position: "top-right" | "bottom-right") => void;
  onSizeChange: (size: "small" | "medium" | "large") => void;
  selectedPosition: "top-right" | "bottom-right";
  selectedSize: "small" | "medium" | "large";
}

export function BadgeSelector({
  selectedBadge,
  onSelectBadge,
  onPositionChange,
  onSizeChange,
  selectedPosition,
  selectedSize
}: BadgeSelectorProps) {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching badges:', error);
        toast({
          title: "Error",
          description: "Failed to load badges.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Filter badges based on user's premium status
        const isPremium = user?.role === 'premium' || user?.role === 'admin';
        const filteredBadges = data.filter(badge => {
          const visibility = badge.visibility || 'public';
          return visibility === 'public' || (visibility === 'premium' && isPremium);
        });

        // Transform data to include visibility field with default value
        const transformedBadges = filteredBadges.map(badge => ({
          ...badge,
          visibility: badge.visibility || 'public' as 'public' | 'premium'
        }));
        setBadges(transformedBadges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast({
        title: "Error",
        description: "Failed to load badges.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">Loading badges...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Select Badge</h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onSelectBadge("")}
              className={`p-2 border rounded-lg text-center ${
                !selectedBadge ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <div className="text-xs">None</div>
            </button>
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => onSelectBadge(badge.image_url)}
                className={`p-2 border rounded-lg ${
                  selectedBadge === badge.image_url
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={badge.image_url}
                  alt={badge.name}
                  className="w-8 h-8 object-cover rounded mx-auto"
                />
                <div className="text-xs mt-1 truncate">{badge.name}</div>
                {badge.visibility === 'premium' && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Premium
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBadge && (
        <>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Badge Position</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onPositionChange("top-right")}
                  className={`p-2 border rounded-lg text-center ${
                    selectedPosition === "top-right"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  Top Right
                </button>
                <button
                  onClick={() => onPositionChange("bottom-right")}
                  className={`p-2 border rounded-lg text-center ${
                    selectedPosition === "bottom-right"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  Bottom Right
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Badge Size</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSizeChange("small")}
                  className={`p-2 border rounded-lg text-center ${
                    selectedSize === "small"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => onSizeChange("medium")}
                  className={`p-2 border rounded-lg text-center ${
                    selectedSize === "medium"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => onSizeChange("large")}
                  className={`p-2 border rounded-lg text-center ${
                    selectedSize === "large"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  Large
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
