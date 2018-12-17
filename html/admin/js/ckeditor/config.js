/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */       
 CKEDITOR.editorConfig = function( config )
{
 //  config.filebrowserBrowseUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/jQuery-File-Upload-9.5.7/index.html';
 //  config.filebrowserImageBrowseUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/jQuery-File-Upload-9.5.7/index.html';
  // config.extraPlugins = 'filebrowser';
   config.filebrowserBrowseUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/kcfinder/browse.php?type=files';
   config.filebrowserImageBrowseUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/kcfinder/browse.php?type=images';
   config.filebrowserFlashBrowseUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/kcfinder/browse.php?type=flash';
   config.filebrowserUploadUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/kcfinder/upload.php?type=files';
   config.filebrowserImageUploadUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/kcfinder/upload.php?type=images';
   config.filebrowserFlashUploadUrl = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/kcfinder/upload.php?type=flash';
   config.allowedContent = true;
//config.extraPlugins = 'materials';
//config.extraPlugins = '';
//config.extraPlugins = 'lineutils';
//config.extraPlugins = 'widgettemplatemenu';
//config.extraPlugins = 'widget';
//config.extraPlugins = 'widgetcommon';
config.extraPlugins = 'wenzgmap,templates,dialog,dialogui,colordialog,lineutils,widget,widgetcommon,youtube,widgettemplatemenu,widgetbootstrap,fontawesome';
config.contentsCss = document.getElementById("path_for_ckeditor").value + 'html/admin/js/ckeditor/plugins/fontawesome/font-awesome/css/font-awesome.min.css';
config.removeButtons = 'WidgetbootstrapLeftCol,WidgetbootstrapRightCol,WidgetbootstrapAlert,WidgetbootstrapThreeCol,WidgetbootstrapTwoCol,WidgetcommonBox,WidgetcommonQuotebox';
config.youtube_width = '640';
config.youtube_height = '480';
config.youtube_related = true;
config.youtube_older = false;
config.youtube_privacy = false;
config.enterMode = 2;
config.fillEmptyBlocks = false;

};


