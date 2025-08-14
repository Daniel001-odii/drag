import { useEffect, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { Input } from './input';
import { cn } from '../../lib/utils';
import { fontCategories, popularFonts, loadFont } from '../../lib/font-utils';
import type { GoogleFont } from '../../lib/font-utils';

interface FontSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function FontSelector({ 
  value, 
  onValueChange, 
  className,
  placeholder = "Select font..." 
}: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  
  // System fonts
  const systemFonts: GoogleFont[] = [
    { family: 'Arial', variants: ['regular'], category: 'system' },
    { family: 'Helvetica', variants: ['regular'], category: 'system' },
    { family: 'Times New Roman', variants: ['regular'], category: 'system' },
    { family: 'Georgia', variants: ['regular'], category: 'system' },
    { family: 'Verdana', variants: ['regular'], category: 'system' },
    { family: 'Courier New', variants: ['regular'], category: 'system' },
    { family: 'Impact', variants: ['regular'], category: 'system' },
    { family: 'Comic Sans MS', variants: ['regular'], category: 'system' },
    { family: 'Tahoma', variants: ['regular'], category: 'system' },
    { family: 'Trebuchet MS', variants: ['regular'], category: 'system' },
    { family: 'Lucida Console', variants: ['regular'], category: 'system' },
    { family: 'Palatino', variants: ['regular'], category: 'system' },
    { family: 'Garamond', variants: ['regular'], category: 'system' },
    { family: 'Bookman', variants: ['regular'], category: 'system' },
    { family: 'Avant Garde', variants: ['regular'], category: 'system' },
  ];
  
  const [fonts] = useState<GoogleFont[]>([...systemFonts, ...popularFonts]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Load the selected font if it changes
    if (value) {
      loadFont(value).catch(console.error);
    }
  }, [value]);

  const filteredFonts = fonts.filter(font => {
    const matchesSearch = font.family.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFonts = filteredFonts.reduce((acc, font) => {
    if (!acc[font.category]) {
      acc[font.category] = [];
    }
    acc[font.category].push(font);
    return acc;
  }, {} as Record<string, GoogleFont[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between !p-4', className)}
          style={{ fontFamily: value }}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input 
              placeholder="Search fonts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus:ring-0 px-0"
            />
          </div>
        </div>
        <div className="flex gap-1 p-2 border-b overflow-auto">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="text-xs"
          >
            All
          </Button>
          {fontCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollArea className="h-[300px]">
          {filteredFonts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No fonts found.
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedFonts).map(([category, categoryFonts]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                  {categoryFonts.map((font) => (
                    <Button
                      key={font.family}
                      variant="ghost"
                      className={cn(
                        "w-full justify-between h-auto p-2 text-left",
                        value === font.family && "bg-accent"
                      )}
                      onClick={() => {
                        onValueChange(font.family);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === font.family ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span 
                          style={{ fontFamily: font.family }}
                          className="text-sm"
                        >
                          {font.family}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {category}
                      </span>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}