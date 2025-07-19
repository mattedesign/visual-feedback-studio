
# Figmant UX Analyzer - Figma Plugin

This Figma plugin integrates with the Figmant backend API to provide AI-powered UX analysis directly from your Figma designs.

## Features

- **Frame Selection**: Select any frames, components, or groups in Figma
- **Batch Analysis**: Analyze up to 5 selections at once
- **High Quality Export**: Exports at 2x resolution for detailed analysis
- **API Integration**: Secure connection to Figmant backend
- **Progress Tracking**: Real-time feedback during analysis
- **Session Management**: Automatic session creation and management

## Installation

1. Copy all plugin files to your local plugin directory
2. In Figma, go to `Plugins` > `Development` > `Import plugin from manifest...`
3. Select the `manifest.json` file from this directory
4. The plugin will be available in your Plugins menu

## Setup

1. **Get API Key**: 
   - Log into your Figmant dashboard
   - Go to Settings > API Keys
   - Create a new API key with read/write permissions

2. **Configure Plugin**:
   - Open the plugin in Figma
   - Enter your API key in the configuration section
   - Click "Save API Key" to store it locally

## Usage

1. **Select Designs**: Select the frames, components, or groups you want to analyze
2. **Add Context** (Optional): Provide analysis context for more targeted results
3. **Run Analysis**: Click "Analyze Selection" to start the process
4. **View Results**: Check your Figmant dashboard for detailed analysis results

## Technical Details

### Supported Selection Types
- Frames
- Components
- Component Instances
- Groups

### Export Format
- PNG format at 2x resolution
- Maximum 5 selections per analysis
- Base64 encoded for API transmission

### API Integration
- Uses Figmant plugin API endpoint: `/figmant-plugin-api`
- Automatic session creation and management
- Real-time progress updates
- Error handling and user feedback

### Security
- API keys stored securely in Figma's client storage
- HTTPS communication with backend
- No design data stored locally

## Troubleshooting

### Common Issues

**"Please select at least one frame"**
- Make sure you have frames, components, or groups selected
- Text layers and shapes cannot be analyzed directly

**"API Key Required"**
- Enter your API key in the plugin settings
- Verify the key is correct in your Figmant dashboard

**"Analysis failed"**
- Check your internet connection
- Verify your API key has the correct permissions
- Ensure selected frames aren't too complex

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key permissions in Figmant dashboard
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
