import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'summernote/dist/summernote-lite.min.js';
import 'summernote/dist/summernote-lite.min.css';

const SummernoteEditor = ({ value, onChange, placeholder = 'Enter your content here...' }) => {
    const editorRef = useRef(null);
    const valueRef = useRef(value);

    // Update valueRef when value prop changes
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        // Initialize Summernote
        if (editorRef.current) {
            const $editor = $(editorRef.current);

            $editor.summernote({
                placeholder,
                tabsize: 2,
                height: 300,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture']],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ],
                callbacks: {
                    onChange: function (contents) {
                        if (onChange && contents !== valueRef.current) {
                            onChange(contents);
                        }
                    }
                }
            });

            // Set the initial value
            if (value) {
                $editor.summernote('code', value);
            }

            // Clean up on component unmount
            return () => {
                $editor.summernote('destroy');
            };
        }
    }, []);

    // Update editor content if value prop changes
    useEffect(() => {
        if (editorRef.current && value !== undefined) {
            const $editor = $(editorRef.current);
            const currentContent = $editor.summernote('code');

            // Only update if the content is different to avoid cursor jumps
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