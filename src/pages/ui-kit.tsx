'use client';

import React, { useState } from 'react';

// shadcn components
import { Button }       from '@/modules/shared/ui/shadcn/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/modules/shared/ui/shadcn/card';
import { Badge }        from '@/modules/shared/ui/shadcn/badge';
import { Input }        from '@/modules/shared/ui/shadcn/input';
import { Label }        from '@/modules/shared/ui/shadcn/label';
import { Textarea }     from '@/modules/shared/ui/shadcn/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/shadcn/select';
import { Checkbox }     from '@/modules/shared/ui/shadcn/checkbox';
import { RadioGroup, RadioGroupItem } from '@/modules/shared/ui/shadcn/radio-group';
import { Switch }       from '@/modules/shared/ui/shadcn/switch';
import { Slider }       from '@/modules/shared/ui/shadcn/slider';
import { Progress }     from '@/modules/shared/ui/shadcn/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/modules/shared/ui/shadcn/avatar';
import { Separator }    from '@/modules/shared/ui/shadcn/separator';
import { Skeleton }     from '@/modules/shared/ui/shadcn/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/modules/shared/ui/shadcn/tooltip';
import { Alert, AlertTitle, AlertDescription } from '@/modules/shared/ui/shadcn/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/modules/shared/ui/shadcn/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/modules/shared/ui/shadcn/accordion';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/modules/shared/ui/shadcn/dropdown-menu';

// icons
import {
  Mail, Loader2, Trash2, Plus, ExternalLink,
  Star, TrendingUp, Users, BriefcaseBusiness,
  Info, AlertTriangle, CheckCircle2, ChevronDown,
  Bell, Settings, LogOut, User,
} from 'lucide-react';
import { ThemeToggle } from '@/modules/shared/ui';

// ─── Layout helpers ───────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-12">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">{title}</p>
    <hr className="border-border mb-6" />
    {children}
  </div>
);

const Row = ({ label, children }: { label?: string; children: React.ReactNode }) => (
  <div className="mb-5">
    {label && <p className="text-xs text-muted-foreground mb-3">{label}</p>}
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UIKitPage() {
  const [loading, setLoading]     = useState(false);
  const [checked, setChecked]     = useState(false);
  const [radio, setRadio]         = useState('candidate');
  const [switched, setSwitched]   = useState(false);
  const [slider, setSlider]       = useState([40]);
  const [progress]                = useState(68);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background py-10 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
                UI Kit
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                shadcn/ui components — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">src/components/ui/shadcn</code>
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* ═══════════════════════════════════════════════════════ BUTTON */}
          <Section title="Button">
            <Row label="Variants">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="gradient">Gradient</Button>
              <Button variant="link">Link</Button>
            </Row>
            <Row label="Sizes">
              <Button size="xs">xs</Button>
              <Button size="sm">sm</Button>
              <Button size="default">default</Button>
              <Button size="lg">lg</Button>
              <Button size="xl">xl</Button>
            </Row>
            <Row label="Icons & states">
              <Button><Mail className="size-4" />Send</Button>
              <Button variant="outline">Open <ExternalLink className="size-4" /></Button>
              <Button variant="destructive"><Trash2 className="size-4" />Delete</Button>
              <Button size="icon" variant="outline"><Plus /></Button>
              <Button
                disabled={loading}
                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? 'Loading…' : 'Click me'}
              </Button>
              <Button disabled>Disabled</Button>
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ BADGE */}
          <Section title="Badge">
            <Row label="Variants">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </Row>
            <Row label="With icons">
              <Badge><CheckCircle2 className="size-3" />Hired</Badge>
              <Badge variant="secondary"><Star className="size-3" />Top rated</Badge>
              <Badge variant="destructive"><AlertTriangle className="size-3" />Rejected</Badge>
              <Badge variant="outline"><Info className="size-3" />Pending</Badge>
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ CARD */}
          <Section title="Card">
            <Row label="With footer">
              <Card className="w-72">
                <CardHeader>
                  <CardTitle>Job offer</CardTitle>
                  <CardDescription>Senior Frontend Engineer · Remote</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Build AI-powered recruitment tools with React and TypeScript.</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm">Apply now</Button>
                  <Button size="sm" variant="outline">Save</Button>
                </CardFooter>
              </Card>
            </Row>
            <Row label="With action slot">
              <Card className="w-72">
                <CardHeader>
                  <CardTitle>Interview score</CardTitle>
                  <CardDescription>AI assessment result</CardDescription>
                  <CardAction><span className="text-2xl font-bold text-primary">87%</span></CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Strong performance across technical and soft skill assessments.</p>
                </CardContent>
              </Card>
            </Row>
            <Row label="Stat cards">
              {[
                { label: 'Candidates', value: '1,284', icon: Users,             color: 'text-primary',   bg: 'bg-primary/10'   },
                { label: 'Positions',  value: '42',    icon: BriefcaseBusiness, color: 'text-secondary', bg: 'bg-secondary/10' },
                { label: 'Avg. score', value: '76%',   icon: TrendingUp,        color: 'text-[#52E899]', bg: 'bg-[#52E899]/10' },
                { label: 'Top rated',  value: '318',   icon: Star,              color: 'text-amber-500', bg: 'bg-amber-50'     },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="w-40 gap-3 py-4">
                  <CardHeader className="px-4">
                    <div className={`size-9 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`size-5 ${color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4">
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ FORM INPUTS */}
          <Section title="Input · Label · Textarea · Select">
            <Row label="Input">
              <div className="flex flex-col gap-1.5 w-64">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="flex flex-col gap-1.5 w-64">
                <Label htmlFor="dis">Disabled</Label>
                <Input id="dis" placeholder="Cannot edit" disabled />
              </div>
            </Row>
            <Row label="Textarea">
              <div className="flex flex-col gap-1.5 w-72">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself…" rows={3} />
              </div>
            </Row>
            <Row label="Select">
              <div className="flex flex-col gap-1.5 w-48">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">Candidate</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ CHECKBOX · RADIO · SWITCH */}
          <Section title="Checkbox · Radio · Switch">
            <Row label="Checkbox">
              <div className="flex items-center gap-2">
                <Checkbox id="terms" checked={checked} onCheckedChange={v => setChecked(!!v)} />
                <Label htmlFor="terms">I agree to the terms</Label>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <Checkbox id="dis2" disabled />
                <Label htmlFor="dis2">Disabled</Label>
              </div>
            </Row>
            <Row label="Radio group">
              <RadioGroup value={radio} onValueChange={setRadio} className="flex gap-4">
                {['candidate', 'company', 'employee'].map(v => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem value={v} id={`r-${v}`} />
                    <Label htmlFor={`r-${v}`} className="capitalize">{v}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Row>
            <Row label="Switch">
              <div className="flex items-center gap-2">
                <Switch id="notif" checked={switched} onCheckedChange={setSwitched} />
                <Label htmlFor="notif">Notifications {switched ? 'on' : 'off'}</Label>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <Switch disabled />
                <Label>Disabled</Label>
              </div>
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ SLIDER · PROGRESS */}
          <Section title="Slider · Progress">
            <Row label="Slider">
              <div className="w-64 flex flex-col gap-2">
                <Slider value={slider} onValueChange={setSlider} min={0} max={100} step={1} />
                <p className="text-xs text-muted-foreground">Value: {slider[0]}%</p>
              </div>
            </Row>
            <Row label="Progress">
              <div className="w-64 flex flex-col gap-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
              <div className="w-64 flex flex-col gap-2">
                <Progress value={100} className="[&>div]:bg-[#52E899]" />
                <p className="text-xs text-muted-foreground">100% — success color</p>
              </div>
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ AVATAR · SKELETON */}
          <Section title="Avatar · Separator · Skeleton">
            <Row label="Avatar">
              <Avatar className="size-8"><AvatarImage src="" /><AvatarFallback>JD</AvatarFallback></Avatar>
              <Avatar><AvatarImage src="" /><AvatarFallback>AC</AvatarFallback></Avatar>
              <Avatar className="size-12"><AvatarImage src="" /><AvatarFallback>TK</AvatarFallback></Avatar>
              <Avatar className="size-14 text-lg"><AvatarImage src="" /><AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback></Avatar>
            </Row>
            <Row label="Separator">
              <div className="w-64">
                <p className="text-sm">Above</p>
                <Separator className="my-3" />
                <p className="text-sm">Below</p>
              </div>
              <div className="flex items-center gap-3 h-8">
                <span className="text-sm">Left</span>
                <Separator orientation="vertical" />
                <span className="text-sm">Right</span>
              </div>
            </Row>
            <Row label="Skeleton">
              <div className="flex flex-col gap-2 w-64">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ ALERT */}
          <Section title="Alert">
            <div className="flex flex-col gap-3 max-w-lg">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>Your interview is scheduled for tomorrow at 10:00 AM.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
              </Alert>
            </div>
          </Section>

          {/* ═══════════════════════════════════════════════════════ TOOLTIP */}
          <Section title="Tooltip">
            <Row label="Examples">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon"><Info className="size-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>More information</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent side="right">This is a tooltip on the right</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge>New feature</Badge>
                </TooltipTrigger>
                <TooltipContent>Released in v2.4</TooltipContent>
              </Tooltip>
            </Row>
          </Section>

          {/* ═══════════════════════════════════════════════════════ TABS */}
          <Section title="Tabs">
            <Tabs defaultValue="overview" className="max-w-lg">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Card><CardContent className="pt-4 text-sm text-muted-foreground">Candidate overview content goes here.</CardContent></Card>
              </TabsContent>
              <TabsContent value="skills">
                <Card><CardContent className="pt-4 text-sm text-muted-foreground">Skills & assessments content goes here.</CardContent></Card>
              </TabsContent>
              <TabsContent value="history">
                <Card><CardContent className="pt-4 text-sm text-muted-foreground">Interview history content goes here.</CardContent></Card>
              </TabsContent>
            </Tabs>
          </Section>

          {/* ═══════════════════════════════════════════════════════ ACCORDION */}
          <Section title="Accordion">
            <Accordion type="single" collapsible className="max-w-lg">
              <AccordionItem value="q1">
                <AccordionTrigger>What is TalentAI?</AccordionTrigger>
                <AccordionContent>TalentAI automates your hiring pipeline with AI-powered interview agents that assess candidates objectively.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How does scoring work?</AccordionTrigger>
                <AccordionContent>Our AI evaluates verbal responses, coverage depth, and soft skills using large language models trained on recruitment data.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>All data is encrypted at rest and in transit. We comply with GDPR and applicable data protection regulations.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          {/* ═══════════════════════════════════════════════════════ DROPDOWN */}
          <Section title="Dropdown Menu">
            <Row label="Examples">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Options <ChevronDown className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><User className="size-4" />Profile</DropdownMenuItem>
                  <DropdownMenuItem><Settings className="size-4" />Settings</DropdownMenuItem>
                  <DropdownMenuItem><Bell className="size-4" />Notifications</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive"><LogOut className="size-4" />Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost"><ChevronDown /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Row>
          </Section>

        </div>
      </div>
    </TooltipProvider>
  );
}
