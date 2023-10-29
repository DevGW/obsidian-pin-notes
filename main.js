const {Plugin, TFile, ItemView, WorkspaceLeaf, Menu} = require('obsidian');

class PinNotes extends Plugin {
    pinnedNotes = [];

    async onload() {
        this.plugin = this;

        setTimeout(() => {
            this.loadPinnedNotesIntoMemory();
            this.registerView('pinned-notes-sidebar', (leaf) => new PinnedNotesSidebarView(leaf, this));
        }, 3000);

        this.addRibbonIcon('pin', 'Show Pinned Notes', () => {
            this.togglePinnedNotesSidebar();
        });

        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
                console.log("file-menu event triggered");
                let content = this.app.vault.read(file);
                let isPinned = this.isNotePinned(file);

                console.log("File isPinned status: ", isPinned);

                menu.addItem((item) => {
                    console.log("Adding pin/unpin menu item");
                    let noteText = isPinned ? 'Unpin Note' : 'Pin Note';
                    console.log("noteText: ", noteText);
                    item.setTitle(noteText)
                        .setIcon('pin')
                        .onClick(() => {
                            this.pinNote(file);
                        });
                });
            })
        );
    }

    async loadPinnedNotesIntoMemory() {
        console.log("Executing loadPinnedNotesIntoMemory()");

        let markdownFiles = this.app.vault.getMarkdownFiles();

        console.log("Number of markdown files found:", markdownFiles.length);

        for (let file of markdownFiles) {
            let content = await this.app.vault.read(file);

            console.log("Content of file:", file.path, "is:", content);

            if (content.includes('pinned: true')) {
                this.pinnedNotes.push(file.path);
            }
        }
        console.log("Pinned notes loaded into memory: ", this.pinnedNotes);
    }

    isNotePinned(file) {
        return this.pinnedNotes.includes(file.path);
    }

    initializePinnedSidebarTitle() {
        setTimeout(() => {
            let leafIcon = document.querySelector('.workspace-leaf[data-view-type="pinned-notes-sidebar"] .icon-pin');
            if (leafIcon && !leafIcon.nextSibling) {
                let label = document.createElement('span');
                label.className = "pinned-notes-label";
                label.textContent = " Pinned Notes";
                leafIcon.parentNode.insertBefore(label, leafIcon.nextSibling);
            }
        }, 1000);
    }

    togglePinnedNotesSidebar() {
        console.log("Toggling pinned notes sidebar");
        if (this.app.workspace.getLeavesOfType('pinned-notes-sidebar').length) {
            this.app.workspace.getLeavesOfType('pinned-notes-sidebar').forEach(leaf => leaf.detach());
        } else {
            console.log("Creating new pinned notes sidebar");
            this.app.workspace.getLeftLeaf(true).setViewState({
                type: 'pinned-notes-sidebar'
            });
            this.initializePinnedSidebarTitle();
        }
    }

    async pinNote(file) {
        if (!file) {
            file = this.app.workspace.getActiveFile();
        }
        if (!file) {
            return;
        }

        let content = await this.app.vault.read(file);
        let hasFrontMatter = content.startsWith('---');

        if (content.includes('pinned: true')) {
            content = content.replace('\npinned: true', '');
        } else {
            if (hasFrontMatter) {
                content = content.replace('---', '---\npinned: true');
            } else {
                content = '---\npinned: true\n---\n' + content;
            }
        }

        await this.app.vault.modify(file, content);

        this.refreshPinnedNotes(file, content);

        const pinnedSidebar = this.app.workspace.getLeavesOfType('pinned-notes-sidebar')[0]?.view;
        if (pinnedSidebar instanceof PinnedNotesSidebarView) {
            pinnedSidebar.populatePinnedList();
        }
    }

    refreshPinnedNotes(file, content) {
        if (content.includes('pinned: true')) {
            if (!this.isNotePinned(file)) {
                this.pinnedNotes.push(file.path);
            }
        } else {
            const index = this.pinnedNotes.indexOf(file.path);
            if (index > -1) {
                this.pinnedNotes.splice(index, 1);
            }
        }
    }

    async onunload() {
        console.log('unloading plugin');
    }
}

class PinnedNotesSidebarView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.app = plugin.app;
        console.log("Inside PinnedNotesSidebarView constructor");
        setTimeout(() => this.populatePinnedList(), 1000);
    }

    getViewType() {
        return 'pinned-notes-sidebar';
    }

    getDisplayText() {
        return 'Pinned Notes';
    }

    getIcon() {
        return 'pin';
    }

    async populatePinnedList() {
        this.contentEl.empty();

        const pinnedNotesContainer = document.createElement("div");
        pinnedNotesContainer.className = "pinned-notes-container";

        const pinnedNotesHeader = document.createElement("div");
        pinnedNotesHeader.className = "pinned-notes-header";
        pinnedNotesHeader.innerText = "Pinned Notes";
        pinnedNotesContainer.appendChild(pinnedNotesHeader);

        for (let filePath of this.plugin.pinnedNotes) {
            let file = this.app.vault.getAbstractFileByPath(filePath);
            if (file instanceof TFile) {
                let noteItem = document.createElement("div");
                noteItem.className = 'pinned-note-item';

                // Create unpin icon/button
                let unpinIcon = document.createElement("span");
                unpinIcon.className = 'unpin-icon';
                unpinIcon.innerHTML = '&#10006;'; // You can replace this with another icon or character
                unpinIcon.style.marginLeft = "0px"; // Add some spacing between filename and icon
                unpinIcon.style.cursor = "pointer"; // Make it look clickable
                unpinIcon.title = "Unpin this note"; // Tooltip on hover
                noteItem.appendChild(unpinIcon);

                // Create a span for the filename
                let fileNameSpan = document.createElement("span");
                fileNameSpan.innerText = file.basename;
                fileNameSpan.style.marginLeft = "5px"; // Add some spacing between filename and icon
                noteItem.appendChild(fileNameSpan);

                unpinIcon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevents the note opening action when unpinning
                    this.plugin.pinNote(file);
                });

                noteItem.addEventListener('click', () => {
                    const mainPane = this.app.workspace.getLeavesOfType('markdown')[0];
                    if (mainPane) {
                        mainPane.openFile(file);
                    } else {
                        this.app.workspace.activeLeaf.openFile(file);  // fallback to activeLeaf
                    }
                });

                // Attach context menu to each note item
                noteItem.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // Prevent default right-click menu
                    this.showContextMenu(e, file);
                });

                pinnedNotesContainer.appendChild(noteItem);
            }
        }


        // Ensure the pinnedNotesContainer is the first child of contentEl
        this.contentEl.prepend(pinnedNotesContainer);
    }

    showContextMenu(event, file) {
        let menu = new Menu(this.app);

        menu.addItem((item) => item.setTitle("Open").onClick(() => {
            const mainPane = this.app.workspace.getLeavesOfType('markdown')[0];
            if (mainPane) {
                mainPane.openFile(file);
            } else {
                this.app.workspace.activeLeaf.openFile(file);
            }
        }));

        menu.addItem((item) => item.setTitle("Unpin").onClick(() => {
            this.plugin.pinNote(file);
        }));

        menu.showAtPosition({x: event.pageX, y: event.pageY});
    }
}

module.exports = PinNotes;
