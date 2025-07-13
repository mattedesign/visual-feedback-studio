import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, BookOpen, MessageCircle, FileText } from 'lucide-react';
const Help = () => {
  return <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Get help with UX Analysis Studio and learn how to make the most of the platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Getting Started Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Learn the basics of UX analysis and how to use our AI-powered tools.
            </p>
            <Button variant="outline" className="rounded-xl bg-gradient-to-b from-[#EEF2FF] to-[#D8DFF5] shadow-[0px_3px_4px_-1px_rgba(88,71,116,0.15),0px_1px_0px_0px_#FFF_inset,0px_0px_0px_1px_#C2C8D9] inline-flex px-6 py-2.5 justify-center items-center gap-2 border-0 hover:from-[#E6EDFF] hover:to-[#D0D7F0]">View Guide</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Comprehensive documentation covering all features and workflows.
            </p>
            <Button variant="outline" className="rounded-xl bg-gradient-to-b from-[#EEF2FF] to-[#D8DFF5] shadow-[0px_3px_4px_-1px_rgba(88,71,116,0.15),0px_1px_0px_0px_#FFF_inset,0px_0px_0px_1px_#C2C8D9] inline-flex px-6 py-2.5 justify-center items-center gap-2 border-0 hover:from-[#E6EDFF] hover:to-[#D0D7F0]">Browse Docs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Need help? Our support team is here to assist you.
            </p>
            <Button variant="outline" className="rounded-xl bg-gradient-to-b from-[#EEF2FF] to-[#D8DFF5] shadow-[0px_3px_4px_-1px_rgba(88,71,116,0.15),0px_1px_0px_0px_#FFF_inset,0px_0px_0px_1px_#C2C8D9] inline-flex px-6 py-2.5 justify-center items-center gap-2 border-0 hover:from-[#E6EDFF] hover:to-[#D0D7F0]">Get Support</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Find answers to frequently asked questions.
            </p>
            <Button variant="outline" className="rounded-xl bg-gradient-to-b from-[#EEF2FF] to-[#D8DFF5] shadow-[0px_3px_4px_-1px_rgba(88,71,116,0.15),0px_1px_0px_0px_#FFF_inset,0px_0px_0px_1px_#C2C8D9] inline-flex px-6 py-2.5 justify-center items-center gap-2 border-0 hover:from-[#E6EDFF] hover:to-[#D0D7F0]">View FAQ</Button>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Help;