import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/ui/empty-state';
import { Briefcase, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function StyleGuide() {
  return (
    <div className="container py-8 space-y-12 mb-20 md:mb-0">
      <div>
        <h1 className="text-4xl font-bold mb-2">Style Guide</h1>
        <p className="text-muted-foreground">
          A comprehensive showcase of all UI components and their variants for consistent design.
        </p>
      </div>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Primary', class: 'bg-primary text-primary-foreground' },
            { name: 'Secondary', class: 'bg-secondary text-secondary-foreground' },
            { name: 'Accent', class: 'bg-accent text-accent-foreground' },
            { name: 'Destructive', class: 'bg-destructive text-destructive-foreground' },
            { name: 'Muted', class: 'bg-muted text-muted-foreground' },
            { name: 'Card', class: 'bg-card text-card-foreground border' },
          ].map((color) => (
            <Card key={color.name}>
              <CardContent className="p-4">
                <div className={`h-20 rounded-md mb-2 ${color.class} flex items-center justify-center`}>
                  <span className="text-sm font-medium">{color.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Typography</h2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <code className="text-xs text-muted-foreground">text-4xl font-bold</code>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Heading 2</h2>
              <code className="text-xs text-muted-foreground">text-3xl font-bold</code>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Heading 3</h3>
              <code className="text-xs text-muted-foreground">text-2xl font-bold</code>
            </div>
            <div>
              <p className="text-lg">Large paragraph text for emphasis.</p>
              <code className="text-xs text-muted-foreground">text-lg</code>
            </div>
            <div>
              <p>Regular paragraph text for body content.</p>
              <code className="text-xs text-muted-foreground">default</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Small muted text for secondary information.</p>
              <code className="text-xs text-muted-foreground">text-sm text-muted-foreground</code>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Buttons</h2>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="hero">Hero</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Briefcase className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  With Icon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Badges</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Alerts</h2>
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is an informational alert with default styling.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This is a destructive alert for errors and warnings.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Form Elements</h2>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="input">Input</Label>
              <Input id="input" placeholder="Enter text..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textarea">Textarea</Label>
              <Textarea id="textarea" placeholder="Enter longer text..." />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="switch" />
              <Label htmlFor="switch">Toggle switch</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="checkbox" />
              <Label htmlFor="checkbox">Checkbox</Label>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Loading States</h2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Empty States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Empty States</h2>
        <EmptyState
          icon={Briefcase}
          title="No items found"
          description="Get started by creating your first item. It only takes a few seconds."
          action={{
            label: 'Create Item',
            onClick: () => alert('Create action clicked'),
          }}
        />
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the card content area where you can place any content.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Hover Card</CardTitle>
              <CardDescription>Hover over this card</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card has a hover effect with shadow transition.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Highlighted Card</CardTitle>
              <CardDescription>With primary border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card is highlighted with a primary colored border.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
