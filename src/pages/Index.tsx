
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6">AI Design Analysis Platform</h1>
          <p className="text-xl text-slate-300 mb-8">
            Get expert design feedback powered by AI and comprehensive UX knowledge
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/analysis">Start Analysis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Upload your designs and get detailed feedback on UX, accessibility, and conversion optimization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Research-Backed Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Our analysis is enhanced with a comprehensive knowledge base of UX patterns and best practices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Knowledge Recovery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Investigate and restore missing knowledge base entries for optimal analysis quality.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
