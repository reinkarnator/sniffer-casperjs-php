CKEDITOR.dialog.add( 'abbrDi', function ( editor ) {
    return {
        title: 'Adding materials',
        minWidth: 400,
        minHeight: 200,

contents: [
    {
        id: 'tab-basic',
        label: 'Basic Settings',
        elements: [
            {
                type: 'select',
                id: 'sport',
                label: 'Select your favourite sport',
                items: [ [ 'Basketball' ], [ 'Baseball' ], [ 'Hockey' ], [ 'Football' ] ],
                'default': 'Football',
                onChange: function( api ) {
                    // this = CKEDITOR.ui.dialog.select
                    alert( 'Current value: ' + this.getValue() );
                }
            },
            {
                type: 'text',
                id: 'title',
                label: 'Explanation',
                validate: CKEDITOR.dialog.validate.notEmpty( "Explanation field cannot be empty" )
            }
        ]
    },
    {
        id: 'tab-adv',
        label: 'Advanced Settings',
        elements: [
            {
                type: 'text',
                id: 'id',
                label: 'Id'
            }
        ]
    }
]
    };
});