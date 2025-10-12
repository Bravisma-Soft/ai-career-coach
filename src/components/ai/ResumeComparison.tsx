import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TailoredResume } from '@/types/ai';
import { Resume } from '@/types/resume';

interface ResumeComparisonProps {
  original: Resume;
  tailored: TailoredResume;
}

export function ResumeComparison({ original, tailored }: ResumeComparisonProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection('summary')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Summary</CardTitle>
            {isExpanded('summary') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {isExpanded('summary') && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold mb-2 text-muted-foreground">Original</p>
                <p className="text-sm">{original.summary}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-muted-foreground">Tailored</p>
                  <Badge variant="default" className="text-xs">Modified</Badge>
                </div>
                <p className="text-sm bg-primary/10 p-2 rounded">{tailored.tailoredContent.summary}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection('experience')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Experience</CardTitle>
            {isExpanded('experience') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {isExpanded('experience') && (
          <CardContent className="space-y-6">
            {tailored.tailoredContent.experience.map((exp, idx) => {
              const originalExp = original.experience[idx];
              return (
                <div key={exp.id} className="space-y-4 pb-4 border-b last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{exp.position}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                    </div>
                    {exp.changes && exp.changes.length > 0 && (
                      <Badge variant="default" className="text-xs">Modified</Badge>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">Original</p>
                      <ul className="text-sm space-y-1">
                        {originalExp?.description.map((desc, i) => (
                          <li key={i} className="list-disc list-inside">{desc}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">Tailored</p>
                      <ul className="text-sm space-y-1">
                        {exp.description.map((desc, i) => (
                          <li 
                            key={i} 
                            className={`list-disc list-inside ${
                              i >= (originalExp?.description.length || 0) ? 'bg-primary/10 p-1 rounded' : ''
                            }`}
                          >
                            {desc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection('skills')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Skills</CardTitle>
            {isExpanded('skills') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {isExpanded('skills') && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold mb-2 text-muted-foreground">Original</p>
                <div className="flex flex-wrap gap-2">
                  {original.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-muted-foreground">Tailored</p>
                  <Badge variant="default" className="text-xs">Modified</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tailored.tailoredContent.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant={original.skills.includes(skill) ? 'secondary' : 'default'}
                      className={!original.skills.includes(skill) ? 'bg-primary/20' : ''}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
