let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/www/js/novum
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +54 ~/www/js/novum/src/lib/app-config/index.ts
badd +8 ~/www/js/novum/src/routes/+layout.svelte
badd +1 ~/www/js/novum/src/lib/stores/user.ts
badd +7 ~/www/js/novum/src/lib/stores/event-stream.ts
badd +4 ~/www/js/novum/src/lib/stores/app-config.ts
badd +15 ~/www/js/novum/src/lib/app-config/themes/default.ts
badd +24 ~/www/js/novum/src/lib/rxdb/collections/config.ts
badd +8 ~/www/js/novum/src/lib/rxdb/collections/projects.ts
badd +31 ~/www/js/novum/src/lib/rxdb/database.ts
badd +0 ~/.config/kitty/current-theme.conf
argglobal
%argdel
edit ~/www/js/novum/src/lib/app-config/themes/default.ts
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
wincmd _ | wincmd |
vsplit
2wincmd h
wincmd _ | wincmd |
split
1wincmd k
wincmd w
wincmd w
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
wincmd =
argglobal
balt ~/www/js/novum/src/lib/app-config/index.ts
setlocal fdm=expr
setlocal fde=nvim_treesitter#foldexpr()
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=3
setlocal fml=1
setlocal fdn=20
setlocal fen
3
normal! zo
7
normal! zo
let s:l = 15 - ((14 * winheight(0) + 15) / 30)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 15
normal! 032|
wincmd w
argglobal
if bufexists(fnamemodify("~/.config/kitty/current-theme.conf", ":p")) | buffer ~/.config/kitty/current-theme.conf | else | edit ~/.config/kitty/current-theme.conf | endif
if &buftype ==# 'terminal'
  silent file ~/.config/kitty/current-theme.conf
endif
balt ~/www/js/novum/src/lib/app-config/themes/default.ts
setlocal fdm=expr
setlocal fde=nvim_treesitter#foldexpr()
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 9 - ((8 * winheight(0) + 16) / 32)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 9
normal! 026|
wincmd w
argglobal
if bufexists(fnamemodify("~/www/js/novum/src/lib/app-config/index.ts", ":p")) | buffer ~/www/js/novum/src/lib/app-config/index.ts | else | edit ~/www/js/novum/src/lib/app-config/index.ts | endif
if &buftype ==# 'terminal'
  silent file ~/www/js/novum/src/lib/app-config/index.ts
endif
balt ~/www/js/novum/src/lib/stores/app-config.ts
setlocal fdm=expr
setlocal fde=nvim_treesitter#foldexpr()
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=3
setlocal fml=1
setlocal fdn=20
setlocal fen
25
normal! zo
43
normal! zo
let s:l = 54 - ((53 * winheight(0) + 31) / 63)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 54
normal! 013|
wincmd w
argglobal
if bufexists(fnamemodify("~/www/js/novum/src/routes/+layout.svelte", ":p")) | buffer ~/www/js/novum/src/routes/+layout.svelte | else | edit ~/www/js/novum/src/routes/+layout.svelte | endif
if &buftype ==# 'terminal'
  silent file ~/www/js/novum/src/routes/+layout.svelte
endif
balt ~/www/js/novum/src/lib/app-config/index.ts
setlocal fdm=expr
setlocal fde=nvim_treesitter#foldexpr()
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=4
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 8 - ((7 * winheight(0) + 31) / 63)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 8
normal! 046|
wincmd w
4wincmd w
wincmd =
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
