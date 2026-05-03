import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10 bg-secondary/50 border-border focus:border-primary transition-colors"
          />
        </div>
        
        {/* Logo - Centered */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Asper Shop
          </h2>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link to="/products">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Products
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;