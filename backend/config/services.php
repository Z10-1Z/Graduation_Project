<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],


    /*
    |--------------------------------------------------------------------------
    | Google Gemini — used for BOTH LLM chat and embeddings
    | LLM  : gemini-2.5-flash-lite with configured fallbacks
    | Embed: gemini-embedding-001 with 768 dimensions for Pinecone compatibility
    |--------------------------------------------------------------------------
    */
    'gemini' => [
        'key'        => env('GEMINI_API_KEY'),
        'llm_model'  => env('GEMINI_LLM_MODEL',   'gemini-2.5-flash-lite'),
        'fallback_models' => array_values(array_filter(array_map(
            'trim',
            explode(',', env('GEMINI_FALLBACK_MODELS', 'gemma-3-12b-it,gemini-2.5-flash'))
        ))),
        'retry_attempts' => (int) env('GEMINI_RETRY_ATTEMPTS', 1),
        'embed_model' => env('GEMINI_EMBED_MODEL', 'models/gemini-embedding-001'),
        'embed_dimensions' => (int) env('GEMINI_EMBED_DIMENSIONS', 768),
        'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
    ],
    /*
    |--------------------------------------------------------------------------
    | Pinecone — dimension MUST be 768 to match Gemini embeddings
    |--------------------------------------------------------------------------
    */
    'pinecone' => [
        'key'   => env('PINECONE_API_KEY'),
        'index' => env('PINECONE_INDEX', 'rag-system'),
        'host'  => env('PINECONE_HOST'),
    ],
];
