
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Card, CardContent } from '@/components/ui/card';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({
  workflow
}: UploadCanvasStateProps) => {
  return <div className="flex items-center justify-center h-full bg-transparent">
      <div className="w-full max-w-6xl px-8">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Example Prompt Column */}
          <div className="flex flex-col items-center gap-6 flex-1 self-stretch" style={{
            borderRadius: '18px',
            border: '1px solid var(--Stroke-default, rgba(0, 0, 0, 0.06))',
            background: 'var(--Colors-white-white, #FFF)',
            padding: '24px 8px'
          }}>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-4 flex items-center justify-center bg-transparent">
                <img src="/lovable-uploads/07aa2ae9-3a56-48e4-83e7-59cc1f9fb2a1.png" alt="Example Prompt Icon" className="w-9 h-9" />
              </div>
              <h2 className="mb-6" style={{
              color: 'var(--Text-primary, #353535)',
              fontFamily: '"Creato Display"',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '135%'
            }}>
                Example Prompt
              </h2>
            </div>
            
            <div className="space-y-3 flex-1">
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Example prompt 1</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Example prompt 2</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Example prompt 3</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Example prompt 4</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Example prompt 5</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Capabilities Column */}
          <div className="flex flex-col items-center gap-6 flex-1 self-stretch" style={{
            borderRadius: '18px',
            border: '1px solid var(--Stroke-default, rgba(0, 0, 0, 0.06))',
            background: 'var(--Colors-white-white, #FFF)',
            padding: '24px 8px'
          }}>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-4 flex items-center justify-center bg-transparent">
                <img src="/lovable-uploads/206ecc00-ba29-4e57-a5a6-1b8d2eae20f8.png" alt="Capabilities Icon" className="w-9 h-9" />
              </div>
              <h2 className="mb-6" style={{
              color: 'var(--Text-primary, #353535)',
              fontFamily: '"Creato Display"',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '135%'
            }}>
                Capabilities
              </h2>
            </div>
            
            <div className="space-y-3 flex-1">
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Insights backed by 272+ UX research studies</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Creates actionable and detailed insights</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Annotate on specific images</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Comparative results between designs</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Extracts information from UI and recommendati...</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Models Column */}
          <div className="flex flex-col items-center gap-6 flex-1 self-stretch" style={{
            borderRadius: '18px',
            border: '1px solid var(--Stroke-default, rgba(0, 0, 0, 0.06))',
            background: 'var(--Colors-white-white, #FFF)',
            padding: '24px 8px'
          }}>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-4 flex items-center justify-center bg-transparent">
                <img src="/lovable-uploads/2a192cb1-f415-45fe-869b-baaa75f4cd2f.png" alt="Models Icon" className="w-9 h-9" />
              </div>
              <h2 className="mb-6" style={{
              color: 'var(--Text-primary, #353535)',
              fontFamily: '"Creato Display"',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '135%'
            }}>
                Models
              </h2>
            </div>
            
            <div className="space-y-3 flex-1">
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Open AI GPT 4o</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Claude Sonnet 3.5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Claude Sonnet 4</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Claude Opus</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
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
                lineHeight: '150%',
                flex: '1'
              }}>
                  <p>Google Vision</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
