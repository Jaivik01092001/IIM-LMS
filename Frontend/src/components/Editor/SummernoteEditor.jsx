import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'summernote/dist/summernote-lite.min.js';
import 'summernote/dist/summernote-lite.min.css';

const SummernoteEditor = ({ value, onChange, placeholder = 'Enter your content here...' }) => {
    const editorRef = useRef(null);
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        if (editorRef.current) {
            const $editor = $(editorRef.current);

            $editor.summernote({
                placeholder,
                tabsize: 2,
                height: 300,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                    ['fontname', ['fontname']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph', 'height']],
                    ['insert', ['link', 'picture', 'video', 'table', 'hr']],
                    ['view', ['fullscreen', 'codeview', 'help']],
                    ['misc', ['undo', 'redo']]
                ],
                fontNames: [
                    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather', 'Open Sans', 'Roboto', 'Times New Roman'
                ],
                fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '36', '48', '64', '72'],
                callbacks: {
                    onChange: function (contents) {
                        if (onChange && contents !== valueRef.current) {
                            onChange(contents);
                        }
                    }
                }
            });

            if (value) {
                $editor.summernote('code', value);
            }

            return () => {
                $editor.summernote('destroy');
            };
        }
    }, []);

    useEffect(() => {
        if (editorRef.current && value !== undefined) {
            const $editor = $(editorRef.current);
            const currentContent = $editor.summernote('code');
            if (currentContent !== value) {
                $editor.summernote('code', value);
            }
        }
    }, [value]);

    return (
        <div className="summernote-editor-container">
            <div ref={editorRef}></div>
        </div>
    );
};

export default SummernoteEditor;
