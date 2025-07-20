# Figmant UX Analyzer - Figma Plugin

This Figma plugin integrates with the Figmant backend to provide AI-powered UX analysis directly from your Figma designs.

## Features

- **Direct Authentication**: Login with your Figmant credentials directly in the plugin
- **Real-time Analysis**: Analyze selected frames, components, or groups with one click
- **Subscription Integration**: Automatically checks your analysis usage and limits
- **Seamless Upload**: Exports and uploads your designs automatically
- **Progress Tracking**: Real-time feedback during analysis processing
- **Context-Aware**: Add custom context to get targeted analysis results

## Quick Setup

### Prerequisites
- Figma desktop app or web browser
- Active Figmant account with available analyses

### Installation

1. Copy all plugin files to your local plugin directory
2. In Figma, go to `Plugins` > `Development` > `Import plugin from manifest...`
3. Select the `manifest.json` file from this directory
4. The plugin will be available in your Plugins menu

## How to Use

### Authentication
1. Open the plugin in Figma
2. Enter your Figmant email and password
3. Click "Login to Figmant"
4. Your subscription status will be displayed

### Running Analysis
1. Select one or more frames, components, or groups in Figma
2. (Optional) Add a session title and analysis context
3. Click "Analyze Selection"
4. Monitor progress in the plugin
5. Check your Figmant dashboard for detailed results

## Technical Details

### Authentication
- Uses standard Supabase authentication
- Session tokens stored securely in Figma's client storage
- Automatic token validation and refresh
- Subscription status checking

### API Integration
- Uses Figmant plugin API endpoint: `/figmant-plugin-api`
- Automatic session creation and management
- Real-time progress updates
- Comprehensive error handling

### Security
- No sensitive data stored permanently
- Session-based authentication
- Secure token transmission
- Automatic logout on token expiry

### Data Flow
1. **Authentication**: User logs in with Figmant credentials
2. **Selection**: User selects frames/components in Figma
3. **Export**: Plugin exports selected items as images
4. **Upload**: Images uploaded to Figmant backend
5. **Analysis**: AI processes the uploaded designs
6. **Results**: Analysis results available in web dashboard

### Supported Elements
- Frames
- Components and Component Sets
- Component Instances
- Groups
- Any exportable Figma element

### Export Formats
- **PNG**: High-quality raster images (default)
- **JPG**: Compressed raster images
- **SVG**: Vector graphics (where applicable)

## Troubleshooting

### Common Issues

**"Login Required"**
- Enter your Figmant email and password
- Ensure you have an active Figmant account

**"Authentication Failed"**
- Check your email and password
- Verify your internet connection
- Ensure your account is active

**"Analysis Limit Reached"**
- Check your subscription plan
- Upgrade your plan for more analyses
- Wait for your limit to reset

**"No frames selected"**
- Make sure you have frames, components, or groups selected
- Text layers and shapes cannot be analyzed directly

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your account status in Figmant web dashboard
3. Contact Figmant support with error details

## Development

### Building
The plugin uses vanilla JavaScript/TypeScript and doesn't require a build step.

### Testing
1. Use Figma's Plugin Development mode
2. Check browser console for debug information
3. Monitor network requests in developer tools

### API Reference
See the main Figmant API documentation for endpoint details and payload formats.