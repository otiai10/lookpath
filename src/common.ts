export const COMMON_PATHS = [
    // linux and mac
    '/bin',
    '/sbin',
    '/usr/bin',
    '/usr/sbin',
    '/usr/local/bin',
    '/usr/local/sbin',
    // homebrew mac
    '/opt/homebrew/bin',
    '/opt/homebrew/opt/curl/bin',
    '/opt/homebrew/opt/fzf/bin',
    '/opt/homebrew/opt/openssl/bin',
    '/opt/homebrew/opt/ruby/bin',
    '/opt/homebrew/sbin',
    // python
    '/opt/miniconda2/bin',
    '/opt/miniconda3/bin',
    '~/anaconda/bin',
    '~/anaconda2/bin',
    '~/anaconda3/bin',
    // linux
    '/snap/bin',
    '/usr/games',
    '/usr/local/games',
    '/usr/local/go/bin',
    '/usr/local/opt/openssl/bin',
    '/usr/local/opt/ruby/bin',
    // other common globals
    '~/.local/bin',
    '~/.bun/bin',
    '~/.cargo/bin',
    '~/.config/yarn/global/node_modules/.bin',
    '~/.go/bin',
    '~/.rvm/bin',
    '~/.yarn/bin',
] as const;
