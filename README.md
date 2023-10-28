# PinNotes Plugin for Obsidian

This Obsidian plugin allows users to easily pin and unpin their notes, providing quick access to important or frequently-used notes directly from a dedicated "Pinned Notes" sidebar.

## Features

- **Pin/Unpin Notes:** Easily toggle the pinned status of your notes via the context menu.
- **Pinned Notes Sidebar:** A dedicated sidebar view displays all pinned notes for quick access.
- **Automatic Frontmatter Handling:** The plugin smartly detects YAML frontmatter and inserts/removes the `pinned: true` attribute as required.

## Installation

1. Navigate to the Obsidian settings.
2. Go to "Community plugins".
3. Search for "PinNotes" and install it.
4. After installation, make sure the plugin is enabled.

## Usage

### Pinning a Note

1. Right-click on a note in the file explorer.
2. From the context menu, click on "Pin Note".
3. The note will be pinned and the content will be updated with the `pinned: true` frontmatter attribute.

### Unpinning a Note

1. Right-click on a note in the file explorer or from the "Pinned Notes" sidebar.
2. From the context menu, click on "Unpin Note".
3. The `pinned: true` attribute will be removed from the note's content.

### Accessing Pinned Notes

1. Click on the pin icon in the Obsidian ribbon to toggle the "Pinned Notes" sidebar.
2. All pinned notes will be listed in this sidebar. Click on any note to open it.

## Customization

This plugin does not have specific customization options as of now. However, future versions might include them based on user feedback.

## Troubleshooting

- If you encounter issues or unexpected behavior, start by checking the developer console for any errors or logs that might provide clues.
- Ensure that there are no conflicts with other plugins.
- Reach out to the developer or the Obsidian community for further assistance.

## Development

Contributions and feedback are always welcome! If you wish to contribute, please create a pull request on the GitHub repository.

## License

This project is licensed under the MIT License.

---
