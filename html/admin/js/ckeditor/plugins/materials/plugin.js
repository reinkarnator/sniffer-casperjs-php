CKEDITOR.plugins.add("materials", {
    icons: 'materials',
    init: function( editor ) {
        // Plugin logic goes here...

        editor.addCommand( 'abbrDi', new CKEDITOR.dialogCommand( 'abbrDi' ) );

		editor.ui.addButton( 'materials', {
		    label: 'Material',
		    command: 'abbrDi',
		    toolbar: 'insert'
		});

		CKEDITOR.dialog.add('abbrDi', this.path + 'dialogs/materials.js' );
    }
});