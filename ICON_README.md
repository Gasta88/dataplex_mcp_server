# Bundle Icon

## Creating the Icon

The MCPB bundle requires an `icon.png` file for display in Claude Desktop.

### Requirements

- **Format**: PNG
- **Size**: 256x256 pixels (recommended)
- **Background**: Transparent or solid color
- **Content**: Should represent GCP Dataplex or data lineage

### Suggested Design

Create an icon that represents:
- Google Cloud Platform colors (blue, red, yellow, green)
- Data flow or lineage concept
- Database or table symbols
- Dataplex logo elements

### Creating the Icon

You can create the icon using:

1. **Online Tools**:
   - [Canva](https://www.canva.com/) - Free design tool
   - [Figma](https://www.figma.com/) - Professional design tool
   - [GIMP](https://www.gimp.org/) - Free image editor

2. **AI Generation**:
   - Use DALL-E, Midjourney, or similar to generate an icon
   - Prompt: "Simple, modern icon for a data lineage tool, 256x256, transparent background, blue and green colors"

3. **Icon Libraries**:
   - [Flaticon](https://www.flaticon.com/) - Search for "database" or "data flow"
   - [Icons8](https://icons8.com/) - Search for "data lineage"

### Placeholder Icon

If you don't have an icon yet, you can:

1. **Skip the icon**: The bundle will work without it (Claude Desktop will use a default icon)
2. **Use a simple colored square**: Create a 256x256 PNG with your brand color
3. **Use the GCP logo**: Download from Google Cloud's brand resources

### Adding the Icon

Once you have `icon.png`:

1. Place it in the project root directory
2. The build script will automatically include it in the bundle
3. Rebuild the bundle: `npm run bundle`

### Example Icon Prompt for AI

```
Create a simple, modern icon for a data lineage and metadata tool.
- Size: 256x256 pixels
- Style: Flat design, minimal
- Colors: Google Cloud blue (#4285F4) and green (#34A853)
- Elements: Database symbol with connecting lines showing data flow
- Background: Transparent
- Format: PNG
```

## Current Status

⚠️ **No icon.png file is currently present in the repository.**

The bundle will build successfully without it, but adding an icon improves the user experience in Claude Desktop.

