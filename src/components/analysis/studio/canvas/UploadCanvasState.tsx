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
            display: 'flex',
            padding: '24px 8px',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 0 0',
            alignSelf: 'stretch',
            borderRadius: '18px',
            border: '1px solid var(--Stroke-01, #ECECEC)',
            background: 'var(--Surface-01, #FCFCFC)',
            boxShadow: '0px 8px 24px -20px rgba(0, 0, 0, 0.04), 0px 2px 0px 0px #FFF inset, 0px 8px 16px -12px rgba(0, 0, 0, 0.01)',
            backdropFilter: 'blur(6px)'
          }}>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-4 flex items-center justify-center bg-transparent">
                <img src="/lovable-uploads/07aa2ae9-3a56-48e4-83e7-59cc1f9fb2a1.png" alt="Example Prompt Icon" className="w-9 h-9" />
              </div>
              <h2 className="mb-6" style={{
                color: 'var(--Text-primary, #353535)',
                fontFamily: '"Instrument Sans"',
                fontSize: '15px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '24px',
                letterSpacing: '-0.3px',
                textAlign: 'center'
              }}>
                Example Prompt
              </h2>
            </div>
            
            <div className="space-y-3 flex-1 w-full">
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center w-full" style={{
                display: 'flex',
                padding: '8px',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'stretch',
                borderRadius: '8px',
                background: 'var(--Background-secondary, #F5F6FA)',
                width: '100%'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Example prompt 1</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Example prompt 2</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Example prompt 3</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Example prompt 4</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Example prompt 5</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Capabilities Column */}
          <div className="flex flex-col items-center gap-6 flex-1 self-stretch" style={{
            display: 'flex',
            padding: '24px 8px',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 0 0',
            alignSelf: 'stretch',
            borderRadius: '18px',
            border: '1px solid var(--Stroke-01, #ECECEC)',
            background: 'var(--Surface-01, #FCFCFC)',
            boxShadow: '0px 8px 24px -20px rgba(0, 0, 0, 0.04), 0px 2px 0px 0px #FFF inset, 0px 8px 16px -12px rgba(0, 0, 0, 0.01)',
            backdropFilter: 'blur(6px)'
          }}>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-4 flex items-center justify-center bg-transparent">
                <img src="/lovable-uploads/206ecc00-ba29-4e57-a5a6-1b8d2eae20f8.png" alt="Capabilities Icon" className="w-9 h-9" />
              </div>
              <h2 className="mb-6" style={{
                color: 'var(--Text-primary, #353535)',
                fontFamily: '"Instrument Sans"',
                fontSize: '15px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '24px',
                letterSpacing: '-0.3px',
                textAlign: 'center'
              }}>
                Capabilities
              </h2>
            </div>
            
            <div className="space-y-3 flex-1 w-full">
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
                display: 'flex',
                padding: '8px',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'stretch',
                borderRadius: '8px',
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Insights backed by 272+ UX research studies</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Creates actionable and detailed insights</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Annotate on specific images</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Comparative results between designs</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Extracts information from UI and recommendati...</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Models Column */}
          <div className="flex flex-col items-center gap-6 flex-1 self-stretch" style={{
            display: 'flex',
            padding: '24px 8px',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 0 0',
            alignSelf: 'stretch',
            borderRadius: '18px',
            border: '1px solid var(--Stroke-01, #ECECEC)',
            background: 'var(--Surface-01, #FCFCFC)',
            boxShadow: '0px 8px 24px -20px rgba(0, 0, 0, 0.04), 0px 2px 0px 0px #FFF inset, 0px 8px 16px -12px rgba(0, 0, 0, 0.01)',
            backdropFilter: 'blur(6px)'
          }}>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-4 flex items-center justify-center bg-transparent">
                <img src="/lovable-uploads/2a192cb1-f415-45fe-869b-baaa75f4cd2f.png" alt="Models Icon" className="w-9 h-9" />
              </div>
              <h2 className="mb-6" style={{
                color: 'var(--Text-primary, #353535)',
                fontFamily: '"Instrument Sans"',
                fontSize: '15px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '24px',
                letterSpacing: '-0.3px',
                textAlign: 'center'
              }}>
                Models
              </h2>
            </div>
            
            <div className="space-y-3 flex-1 w-full">
              <Card className="bg-gray-50 border-0">
                <CardContent className="flex justify-center items-center self-stretch rounded-lg text-center" style={{
                display: 'flex',
                padding: '8px',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'stretch',
                borderRadius: '8px',
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Open AI GPT 4o</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Claude Sonnet 3.5</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Claude Sonnet 4</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Claude Opus</p>
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
                background: 'var(--Background-secondary, #F5F6FA)'
              }}>
                  <p style={{
                    color: 'var(--Shade-6-100, #7B7B7B)',
                    fontFamily: '"Instrument Sans"',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                    letterSpacing: '-0.12px',
                    textAlign: 'center',
                    paddingBottom: '4px'
                  }}>Google Vision</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
