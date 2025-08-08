// Export all UI components for easier imports
export { Button, buttonVariants } from "./ui-button";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui-card";
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export { Badge, badgeVariants } from "./badge";
export { Checkbox } from "./checkbox";
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
export { Label } from "./label";
export { Progress } from "./progress";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
export { Separator } from "./separator";
export { Skeleton } from "./skeleton";
export { Slider } from "./slider";
export { Switch } from "./switch";
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Textarea } from "./textarea";
export { toast, useToast } from "./toast";

// Legacy exports for backward compatibility
// Note: Button and Card are now exported from lowercase files above
export { default as Input } from "./Input";
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as Logo } from "./Logo";
export { default as SantriAvatar } from "./SantriAvatar";
export { default as UserAvatar } from "./UserAvatar";
export { default as ClientOnly } from "./ClientOnly";
export { default as ErrorDisplay } from "./ErrorDisplay";
export { default as FileUpload } from "./FileUpload";
