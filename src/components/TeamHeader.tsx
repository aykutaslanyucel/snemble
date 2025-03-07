
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function TeamHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-4"
    >
      <Badge
        variant="outline"
        className="px-4 py-1 text-sm font-medium tracking-wide"
      >
        Team Management
      </Badge>
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to Snemble
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Manage your team members, track their availability, and keep everyone in sync with our intuitive team management platform.
      </p>
    </motion.div>
  );
}
