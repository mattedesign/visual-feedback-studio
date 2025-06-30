import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { MessageSquare, Settings, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({
  workflow
}: UploadCanvasStateProps) => {
  return (
    <div className="flex items-center justify-center h-full bg-transparent">
      <div className="w-full max-w-6xl px-8">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Example Prompt Column */}
          <div 
            className="flex flex-col items-center gap-6 flex-1 self-stretch rounded-[18px] border border-black/6 bg-white"
            style={{
              padding: '24px 8px'
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h2 
                className="mb-6"
                style={{
                  color: 'var(--Text-primary, #353535)',
                  fontFamily: '"Creato Display"',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '135%'
                }}
              >
                Example Prompt
              </h2>
            </div>
            
            <div className="space-y-3">
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Example prompt 1</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Example prompt 2</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Example prompt 3</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Example prompt 4</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Example prompt 5</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Capabilities Column */}
          <div 
            className="flex flex-col items-center gap-6 flex-1 self-stretch rounded-[18px] border border-black/6 bg-white"
            style={{
              padding: '24px 8px'
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8 text-slate-600" />
              </div>
              <h2 
                className="mb-6"
                style={{
                  color: 'var(--Text-primary, #353535)',
                  fontFamily: '"Creato Display"',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '135%'
                }}
              >
                Capabilities
              </h2>
            </div>
            
            <div className="space-y-3">
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Insights backed by 272+ UX research studies</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Creates actionable and detailed insights</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Annotate on specific images</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Comparative results between designs</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Extracts information from UI and recommendati...</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Models Column */}
          <div 
            className="flex flex-col items-center gap-6 flex-1 self-stretch rounded-[18px] border border-black/6 bg-white"
            style={{
              padding: '24px 8px'
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-slate-600" />
              </div>
              <h2 
                className="mb-6"
                style={{
                  color: 'var(--Text-primary, #353535)',
                  fontFamily: '"Creato Display"',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '135%'
                }}
              >
                Models
              </h2>
            </div>
            
            <div className="space-y-3">
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Open AI GPT 4o</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Claude Sonnet 3.5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Claude Sonnet 4</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Claude Opus</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent 
                  className="flex justify-center items-center self-stretch rounded-lg text-center"
                  style={{
                    display: 'flex',
                    padding: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: '8px',
                    background: 'var(--Background-secondary, #F5F6FA)',
                    color: 'var(--Text-primary, #353535)',
                    fontFamily: '"Creato Display"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '150%'
                  }}
                >
                  <p>Google Vision</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
