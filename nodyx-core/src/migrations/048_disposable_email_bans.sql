-- Migration 048: Ban known disposable/temporary email domains
-- Domains are stored without the @ prefix; the auth route matches via: $1 LIKE '%@' || email

INSERT INTO email_bans (email, reason) VALUES
-- Mailinator family
('mailinator.com',           'disposable')  ,
('mailinator2.com',          'disposable')  ,
('mailinator.net',           'disposable')  ,
('suremail.info',            'disposable')  ,
('chammy.info',              'disposable')  ,
('tradermail.info',          'disposable')  ,
('mailinater.com',           'disposable')  ,
-- Guerrilla Mail family
('guerrillamail.com',        'disposable')  ,
('guerrillamail.net',        'disposable')  ,
('guerrillamail.org',        'disposable')  ,
('guerrillamail.biz',        'disposable')  ,
('guerrillamail.de',         'disposable')  ,
('guerrillamail.info',       'disposable')  ,
('guerrillamailblock.com',   'disposable')  ,
('sharklasers.com',          'disposable')  ,
('grr.la',                   'disposable')  ,
('guerrillamailblock.com',   'disposable')  ,
('spam4.me',                 'disposable')  ,
('yopmail.com',              'disposable')  ,
('yopmail.fr',               'disposable')  ,
('cool.fr.nf',               'disposable')  ,
('jetable.fr.nf',            'disposable')  ,
('nospam.ze.tc',             'disposable')  ,
('nomail.xl.cx',             'disposable')  ,
('mega.zik.dj',              'disposable')  ,
('speed.1s.fr',              'disposable')  ,
('courriel.fr.nf',           'disposable')  ,
('moncourrier.fr.nf',        'disposable')  ,
('monemail.fr.nf',           'disposable')  ,
('monmail.fr.nf',            'disposable')  ,
-- TrashMail family
('trashmail.com',            'disposable')  ,
('trashmail.me',             'disposable')  ,
('trashmail.at',             'disposable')  ,
('trashmail.io',             'disposable')  ,
('trashmail.net',            'disposable')  ,
('trashmail.org',            'disposable')  ,
('trashmail.xyz',            'disposable')  ,
('trashmail.fr',             'disposable')  ,
('trashmail.de',             'disposable')  ,
-- TempMail / 10 minute mail
('tempmail.com',             'disposable')  ,
('temp-mail.org',            'disposable')  ,
('tempmail.net',             'disposable')  ,
('tempmail.io',              'disposable')  ,
('temporaryemail.com',       'disposable')  ,
('temporaryinbox.com',       'disposable')  ,
('10minutemail.com',         'disposable')  ,
('10minutemail.net',         'disposable')  ,
('10minutemail.org',         'disposable')  ,
('10minutemail.co.za',       'disposable')  ,
('10minutemail.de',          'disposable')  ,
('10minutemail.ru',          'disposable')  ,
('10minemail.com',           'disposable')  ,
('10mail.org',               'disposable')  ,
('minutemailbox.com',        'disposable')  ,
-- Throwaway
('throwaway.email',          'disposable')  ,
('throwam.com',              'disposable')  ,
('throwam.net',              'disposable')  ,
('throwmail.me',             'disposable')  ,
-- Maildrop
('maildrop.cc',              'disposable')  ,
-- Discard
('discard.email',            'disposable')  ,
('discardmail.com',          'disposable')  ,
('discardmail.de',           'disposable')  ,
-- SpamGourmet / SpamFree
('spamgourmet.com',          'disposable')  ,
('spamgourmet.net',          'disposable')  ,
('spamgourmet.org',          'disposable')  ,
('spamfree24.org',           'disposable')  ,
('spamfree24.de',            'disposable')  ,
('spamfree24.info',          'disposable')  ,
('spamfree24.biz',           'disposable')  ,
('spamfree24.com',           'disposable')  ,
('spamspot.com',             'disposable')  ,
('spam.la',                  'disposable')  ,
('spamify.com',              'disposable')  ,
('spaml.com',                'disposable')  ,
('spamthisplease.com',       'disposable')  ,
('spamobox.com',             'disposable')  ,
-- FakeMail / FakeInbox
('fakeinbox.com',            'disposable')  ,
('fakeinbox.net',            'disposable')  ,
('fakemail.net',             'disposable')  ,
('fakemailgenerator.com',    'disposable')  ,
-- Temp / Disposable generic
('dispostable.com',          'disposable')  ,
('mailnull.com',             'disposable')  ,
('mailnesia.com',            'disposable')  ,
('mailexpire.com',           'disposable')  ,
('mailtemporaire.com',       'disposable')  ,
('mailtemporaire.fr',        'disposable')  ,
('mail-temporaire.fr',       'disposable')  ,
('jetable.com',              'disposable')  ,
('jetable.net',              'disposable')  ,
('jetable.org',              'disposable')  ,
('jetable.fr',               'disposable')  ,
('jourrapide.com',           'disposable')  ,
('filzmail.com',             'disposable')  ,
('tempinbox.com',            'disposable')  ,
('tempinbox.co.uk',          'disposable')  ,
('nowmymail.com',            'disposable')  ,
('getairmail.com',           'disposable')  ,
('getairmail.cf',            'disposable')  ,
('spamevader.com',           'disposable')  ,
('deadaddress.com',          'disposable')  ,
('superrito.com',            'disposable')  ,
('kurzepost.de',             'disposable')  ,
('objectmail.com',           'disposable')  ,
('rejectmail.com',           'disposable')  ,
('rmqkr.net',                'disposable')  ,
('royal.net',                'disposable')  ,
('sogetthis.com',            'disposable')  ,
('spamstack.net',            'disposable')  ,
('stuffmail.de',             'disposable')  ,
('supergreatmail.com',       'disposable')  ,
('suremail.info',            'disposable')  ,
('tafmail.com',              'disposable')  ,
('tagyourself.com',          'disposable')  ,
('teleworm.com',             'disposable')  ,
('teleworm.us',              'disposable')  ,
('thisisnotmyrealemail.com', 'disposable')  ,
('trashdevil.com',           'disposable')  ,
('trashdevil.de',            'disposable')  ,
('trashmail2.com',           'disposable')  ,
('tyldd.com',                'disposable')  ,
('uggsrock.com',             'disposable')  ,
('uroid.com',                'disposable')  ,
('veryrealemail.com',        'disposable')  ,
('viditag.com',              'disposable')  ,
('wetrainbayarea.com',       'disposable')  ,
('zetmail.com',              'disposable')  ,
-- Cock.li and alikes (abuse-prone)
('cock.li',                  'disposable')  ,
('airmail.cc',               'disposable')  ,
('cock.email',               'disposable')  ,
-- GoWiki
('gowikibooks.com',          'disposable')  ,
('gowikicampus.com',         'disposable')  ,
('gowikicars.com',           'disposable')  ,
('gowikifilms.com',          'disposable')  ,
('gowikigames.com',          'disposable')  ,
('gowikimusic.com',          'disposable')  ,
('gowikinetwork.com',        'disposable')  ,
('gowikitravel.com',         'disposable')  ,
('gowikitv.com',             'disposable')  ,
-- Mailbox
('maibox.org',               'disposable')  ,
('mailbox92.biz',            'disposable')  ,
('mailbox80.biz',            'disposable')  ,
-- Spamex
('spamex.com',               'disposable')  ,
-- Nospamfor
('nospamfor.us',             'disposable')  ,
('nospammail.net',           'disposable')  ,
-- BurnerMail / Burner
('burnermail.io',            'disposable')  ,
-- DuckMail
('duck.com',                 'disposable')  ,
-- SimpleLogin (forwarding, abuse-prone)
('simplelogin.com',          'disposable')  ,
('simplelogin.fr',           'disposable')  ,
-- AnonAddy
('anonaddy.com',             'disposable')  ,
('anonaddy.me',              'disposable')  ,
-- Mailsac
('mailsac.com',              'disposable')  ,
-- Inboxbear
('inboxbear.com',            'disposable')  ,
-- Mohmal
('mohmal.com',               'disposable')  ,
-- GuerrillaMail extras
('spamgob.com',              'disposable')  ,
-- Crap mail
('crapmail.org',             'disposable')  ,
-- Emailondeck
('emailondeck.com',          'disposable')  ,
-- Spamovore
('spamovore.com',            'disposable')  ,
-- Tempr
('tempr.email',              'disposable')  ,
-- Nwldx
('nwldx.com',                'disposable')  ,
-- Getonemail
('getonemail.com',           'disposable')  ,
-- Mailsucker
('mailsucker.net',           'disposable')  ,
-- Spamhereplease
('spamhereplease.com',       'disposable')  ,
-- IncognitoMail
('incognitomail.com',        'disposable')  ,
('incognitomail.net',        'disposable')  ,
('incognitomail.org',        'disposable')  ,
-- MailMe
('mailme.lv',                'disposable')  ,
-- OwlyMail
('owlymail.com',             'disposable')  ,
-- Notmailinator
('notmailinator.com',        'disposable')  ,
-- MxFwd
('mxfwd.com',                'disposable')  ,
-- NoSpam
('nospam.ws',                'disposable')  ,
-- Knol-power
('knol-power.nl',            'disposable')  ,
-- Irgendwo
('irgendwo.info',            'disposable')  ,
-- Rppkn
('rppkn.com',                'disposable')  ,
-- Binkmail
('binkmail.com',             'disposable')  ,
-- Safetymail
('safetymail.info',          'disposable')  ,
-- Spam
('spam.su',                  'disposable')  ,
-- Mailmetrash
('mailmetrash.com',          'disposable')  ,
-- Mailscrap
('mailscrap.com',            'disposable')  ,
-- Pookmail
('pookmail.com',             'disposable')  ,
-- RecycleMail
('recyclemail.dk',           'disposable')  ,
-- TempEMail
('tempemail.net',            'disposable')  ,
('tempemail.co.za',          'disposable')  ,
-- GreenSloth
('greensloth.com',           'disposable')  ,
-- Spam4
('spam4.me',                 'disposable')  ,
-- Thc
('thc.st',                   'disposable')  ,
-- S0ny
('s0ny.net',                 'disposable')  ,
-- Toiea
('toiea.com',                'disposable')  ,
-- Trashcanmail
('trashcanmail.com',         'disposable')  ,
-- Diapersmail
('diapersmail.com',          'disposable')  ,
-- Dingbone
('dingbone.com',             'disposable')  ,
-- Dontreg
('dontreg.com',              'disposable')  ,
-- Dontsendmespam
('dontsendmespam.de',        'disposable')  ,
-- Easytrashmail
('easytrashmail.com',        'disposable')  ,
-- Emailias
('emailias.com',             'disposable')  ,
-- Emailinfive
('emailinfive.com',          'disposable')  ,
-- Emailsensei
('emailsensei.com',          'disposable')  ,
-- Emailtemporanea
('emailtemporanea.com',      'disposable')  ,
('emailtemporanea.net',      'disposable')  ,
-- Emailtemporario
('emailtemporario.com.br',   'disposable')  ,
-- Emailthe
('emailthe.net',             'disposable')  ,
-- Emailtmp
('emailtmp.com',             'disposable')  ,
-- Emailwarden
('emailwarden.com',          'disposable')  ,
-- Emailx
('emailx.at.hm',             'disposable')  ,
-- Enterto
('enterto.com',              'disposable')  ,
-- Ephemail
('ephemail.net',             'disposable')  ,
-- Etranquil
('etranquil.com',            'disposable')  ,
('etranquil.net',            'disposable')  ,
('etranquil.org',            'disposable')  ,
-- Explodemail
('explodemail.com',          'disposable')  ,
-- Fightallspam
('fightallspam.com',         'disposable')  ,
-- Fleckens
('fleckens.hu',              'disposable')  ,
-- Frapmail
('frapmail.com',             'disposable')  ,
-- Freundin
('freundin.ru',              'disposable')  ,
-- Friendlymail
('friendlymail.co.uk',       'disposable')  ,
-- Front14
('front14.org',              'disposable')  ,
-- Fudgerub
('fudgerub.com',             'disposable')  ,
-- Garbagemail
('garbagemail.org',          'disposable')  ,
-- Goemailgo
('goemailgo.com',            'disposable')  ,
-- Gotmail
('gotmail.net',              'disposable')  ,
('gotmail.org',              'disposable')  ,
-- Hailmail
('hailmail.net',             'disposable')  ,
-- Hidzz
('hidzz.com',                'disposable')  ,
-- Hulapla
('hulapla.de',               'disposable')  ,
-- Hushmail variants used for throwaway
('hushmail.com',             'disposable')  ,
-- Ieatspam
('ieatspam.eu',              'disposable')  ,
('ieatspam.info',            'disposable')  ,
-- Ihateyoualot
('ihateyoualot.info',        'disposable')  ,
-- Inboxclean
('inboxclean.com',           'disposable')  ,
('inboxclean.org',           'disposable')  ,
-- Insorg
('insorg-mail.info',         'disposable')  ,
-- Instant-mail
('instant-mail.de',          'disposable')  ,
-- Ipoo
('ipoo.org',                 'disposable')  ,
-- Irish2me
('irish2me.com',             'disposable')  ,
-- Jnxjn
('jnxjn.com',                'disposable')  ,
-- Joaap
('joaap.org',                'disposable')  ,
-- Junk1
('junk1.com',                'disposable')  ,
-- Kasmail
('kasmail.com',              'disposable')  ,
-- Kaspop
('kaspop.com',               'disposable')  ,
-- Killmail
('killmail.com',             'disposable')  ,
('killmail.net',             'disposable')  ,
-- Klassmaster
('klassmaster.com',          'disposable')  ,
-- Klzlk
('klzlk.com',                'disposable')  ,
-- Koszmail
('koszmail.pl',              'disposable')  ,
-- Kulturbetrieb
('kulturbetrieb.info',       'disposable')  ,
-- Letthemeatspam
('letthemeatspam.com',       'disposable')  ,
-- Lhsdv
('lhsdv.com',                'disposable')  ,
-- Ligsb
('ligsb.com',                'disposable')  ,
-- Lol
('lol.com',                  'disposable')  ,
-- Lolfreak
('lolfreak.net',             'disposable')  ,
-- Lookugly
('lookugly.com',             'disposable')  ,
-- Lortemail
('lortemail.dk',             'disposable')  ,
-- Losemymail
('losemymail.com',           'disposable')  ,
-- Lroid
('lroid.com',                'disposable')  ,
-- Lukop
('lukop.dk',                 'disposable')  ,
-- M21
('m21.cc',                   'disposable')  ,
-- Maboard
('maboard.com',              'disposable')  ,
-- Mailbucket
('mailbucket.org',           'disposable')  ,
-- Mailcat
('mailcat.biz',              'disposable')  ,
-- Mailcatch
('mailcatch.com',            'disposable')  ,
-- Mailde
('mailde.de',                'disposable')  ,
('mailde.info',              'disposable')  ,
-- Maildu
('maildu.de',                'disposable')  ,
-- Maileimer
('maileimer.de',             'disposable')  ,
-- Mailfreeonline
('mailfreeonline.com',       'disposable')  ,
-- Mailguard
('mailguard.me',             'disposable')  ,
-- Mailimate
('mailimate.com',            'disposable')  ,
-- Mailin8r
('mailin8r.com',             'disposable')  ,
-- Mailinator extras
('notmailinator.com',        'disposable')  ,
('vomoto.com',               'disposable')  ,
('tempalias.com',            'disposable')  ,
-- Inboxkitten
('inboxkitten.com',          'disposable')  ,
-- MailNull
('mailnull.com',             'disposable')  ,
-- Meltmail
('meltmail.com',             'disposable')  ,
-- Mierdamail
('mierdamail.com',           'disposable')  ,
-- Mintemail
('mintemail.com',            'disposable')  ,
-- Misterpinball
('misterpinball.de',         'disposable')  ,
-- Mmmmail
('mmmmail.com',              'disposable')  ,
-- Mobileninja
('mobileninja.co.uk',        'disposable')  ,
-- Moncourrier
('moncourrier.fr.nf',        'disposable')  ,
-- Monemail
('monemail.fr.nf',           'disposable')  ,
-- Monmail
('monmail.fr.nf',            'disposable')  ,
-- MuadMail / muadib
('muadib.id.au',             'disposable')  ,
-- Myspamless
('myspamless.com',           'disposable')  ,
-- Netzidiot
('netzidiot.de',             'disposable')  ,
-- Neuf
('neuf.fr',                  'disposable')  ,
-- Newairmail
('newairmail.com',           'disposable')  ,
-- Nincsmail
('nincsmail.com',            'disposable')  ,
-- NobodyEnjoysMail
('nobodyenjoys.com',         'disposable')  ,
-- Nomail
('nomail.com',               'disposable')  ,
('nomail.pw',                'disposable')  ,
('nomail.xl.cx',             'disposable')  ,
-- Nospam
('nospam.ze.tc',             'disposable')  ,
('nospam4.us',               'disposable')  ,
('nospamthanks.info',        'disposable')  ,
-- Nothingtoseehere
('nothingtoseehere.ca',      'disposable')  ,
-- Nwytg
('nwytg.net',                'disposable')  ,
-- Objectmail
('objectmail.com',           'disposable')  ,
-- OneOffEmail
('oneoffmail.com',           'disposable')  ,
-- Opayq
('opayq.com',                'disposable')  ,
-- Ordinaryamerican
('ordinaryamerican.net',     'disposable')  ,
-- Otherinbox
('otherinbox.com',           'disposable')  ,
-- Ourklips
('ourklips.com',             'disposable')  ,
-- Outlawspam
('outlawspam.com',           'disposable')  ,
-- Ovpn
('ovpn.to',                  'disposable')  ,
-- Pecinan
('pecinan.com',              'disposable')  ,
('pecinan.net',              'disposable')  ,
('pecinan.org',              'disposable')  ,
-- Pepbot
('pepbot.com',               'disposable')  ,
-- Pjjkp
('pjjkp.com',                'disposable')  ,
-- Plexolan
('plexolan.de',              'disposable')  ,
-- Pmails
('pmails.info',              'disposable')  ,
-- Politikerclub
('politikerclub.de',         'disposable')  ,
-- Pokemail
('pokemail.net',             'disposable')  ,
-- Polarkingdom
('polarkingdom.com',         'disposable')  ,
-- Privy-mail
('privy-mail.com',           'disposable')  ,
('privy-mail.de',            'disposable')  ,
-- Proxymail
('proxymail.eu',             'disposable')  ,
-- Psych0analyst
('psych0analyst.com',        'disposable')  ,
-- Puts
('puts.cc',                  'disposable')  ,
-- qq variants used for throwaway
('qq.com',                   'disposable')  ,
-- Quickinbox
('quickinbox.com',           'disposable')  ,
-- Rcpt
('rcpt.at',                  'disposable')  ,
-- Recode.me
('recode.me',                'disposable')  ,
-- Recursor
('recursor.net',             'disposable')  ,
-- Refugeeks
('refugeeks.com',            'disposable')  ,
-- Safetypost
('safetypost.de',            'disposable')  ,
-- Sandelf
('sandelf.de',               'disposable')  ,
-- Schafmail
('schafmail.de',             'disposable')  ,
-- Schrott24
('schrott24.de',             'disposable')  ,
-- Sectioneight
('sectioneight.net',         'disposable')  ,
-- Secure-email
('secure-email.cc',          'disposable')  ,
-- Sekundenmail
('sekundenmail.de',          'disposable')  ,
-- SendSpamHere
('sendspamhere.com',         'disposable')  ,
-- Sharedmailbox
('sharedmailbox.org',        'disposable')  ,
-- Sify
('sifymail.com',             'disposable')  ,
-- Simpleitsecurity
('simpleitsecurity.com',     'disposable')  ,
-- Skeefmail
('skeefmail.com',            'disposable')  ,
-- Slopsbox
('slopsbox.com',             'disposable')  ,
-- Smashmail
('smashmail.de',             'disposable')  ,
-- Smellfear
('smellfear.com',            'disposable')  ,
-- Snakemail
('snakemail.com',            'disposable')  ,
-- Sneakemail
('sneakemail.com',           'disposable')  ,
-- Sneakmail
('sneakmail.de',             'disposable')  ,
-- Snkmail
('snkmail.com',              'disposable')  ,
-- Sofimail
('sofimail.com',             'disposable')  ,
-- Soodonims
('soodonims.com',            'disposable')  ,
-- Spam
('spam.org.tr',              'disposable')  ,
('spam.pe',                  'disposable')  ,
('spam4.me',                 'disposable')  ,
-- Spamcon
('spamcon.org',              'disposable')  ,
-- Spamcorptastic
('spamcorptastic.com',       'disposable')  ,
-- Spamcowboy
('spamcowboy.com',           'disposable')  ,
('spamcowboy.net',           'disposable')  ,
('spamcowboy.org',           'disposable')  ,
-- Spamday
('spamday.com',              'disposable')  ,
-- SpamFree
('spamfree.eu',              'disposable')  ,
-- Spamgob
('spamgob.com',              'disposable')  ,
-- Spamherelots
('spamherelots.com',         'disposable')  ,
-- Spamhereplease
('spamhereplease.com',       'disposable')  ,
-- Spamhole
('spamhole.com',             'disposable')  ,
-- Spaml
('spaml.de',                 'disposable')  ,
-- Spammotel
('spammotel.com',            'disposable')  ,
-- Spammy
('spammy24.com',             'disposable')  ,
-- Spamok
('spamok.com',               'disposable')  ,
-- Spamtrap
('spamtrap.ro',              'disposable')  ,
-- SpamTroll
('spamtroll.net',            'disposable')  ,
-- Spamwc
('spamwc.de',                'disposable')  ,
-- Spamslicer
('spaml.com',                'disposable')  ,
-- Supergreatmail
('supergreatmail.com',       'disposable')  ,
-- Tagmymedia
('tagmymedia.com',           'disposable')  ,
-- Talkinator
('talkinator.com',           'disposable')  ,
-- Tempalias
('tempalias.com',            'disposable')  ,
-- Tempail
('tempail.com',              'disposable')  ,
-- Tempe-mail
('tempe-mail.com',           'disposable')  ,
-- Tempemailaddress
('tempemailaddress.com',     'disposable')  ,
-- Tempemail
('tempemail.biz',            'disposable')  ,
-- Tempinbox
('tempinbox.com',            'disposable')  ,
-- TempMailAddress
('tempmailaddress.com',      'disposable')  ,
-- Tmpmail
('tmpmail.net',              'disposable')  ,
('tmpmail.org',              'disposable')  ,
-- ToMail
('tomail.com',               'disposable')  ,
-- Toomail
('toomail.biz',              'disposable')  ,
-- TopMail
('topranklist.de',           'disposable')  ,
-- Trashmail
('trash-mail.at',            'disposable')  ,
('trash-mail.com',           'disposable')  ,
('trash-mail.de',            'disposable')  ,
('trash-mail.io',            'disposable')  ,
('trash-mail.net',           'disposable')  ,
-- Trillianpro
('trillianpro.com',          'disposable')  ,
-- TrustNoSpam
('trustnosp.am',             'disposable')  ,
-- Twkly
('twkly.com',                'disposable')  ,
-- TXTmail
('txtmail.de',               'disposable')  ,
-- Umail
('umail.net',                'disposable')  ,
-- Unids
('unids.com',                'disposable')  ,
-- Unmail
('unmail.ru',                'disposable')  ,
-- Uroid
('uroid.com',                'disposable')  ,
-- UtilityEmail
('utilitarymail.com',        'disposable')  ,
-- Valemail
('valemail.net',             'disposable')  ,
-- Venompen
('venompen.com',             'disposable')  ,
-- Wegwerfadresse
('wegwerfadresse.de',        'disposable')  ,
-- Wegwerfemail
('wegwerfemail.com',         'disposable')  ,
('wegwerfemail.de',          'disposable')  ,
-- Wegwerfmail
('wegwerfmail.de',           'disposable')  ,
('wegwerfmail.info',         'disposable')  ,
('wegwerfmail.net',          'disposable')  ,
('wegwerfmail.org',          'disposable')  ,
-- Wetrainbayarea
('wetrainbayarea.org',       'disposable')  ,
-- Wh4f
('wh4f.org',                 'disposable')  ,
-- Whyspam
('whyspam.me',               'disposable')  ,
-- Willhackforfood
('willhackforfood.biz',      'disposable')  ,
-- Wilemail
('wilemail.com',             'disposable')  ,
-- Wirelessmail
('wirelessmail.net',         'disposable')  ,
-- WMailer
('wmailer.com',              'disposable')  ,
-- Writeme
('writeme.us',               'disposable')  ,
-- Wronghead
('wronghead.com',            'disposable')  ,
-- Wuzupmail
('wuzupmail.net',            'disposable')  ,
-- Xagloo
('xagloo.com',               'disposable')  ,
-- Xemaps
('xemaps.com',               'disposable')  ,
-- Xents
('xents.com',                'disposable')  ,
-- Xmaily
('xmaily.com',               'disposable')  ,
-- Xoxy
('xoxy.net',                 'disposable')  ,
-- Xsmail
('xsmail.com',               'disposable')  ,
-- Xwpet
('xwpet.com',                'disposable')  ,
-- Yapped
('yapped.net',               'disposable')  ,
-- Yapost
('yapost.com',               'disposable')  ,
-- Yep
('yep.it',                   'disposable')  ,
-- Yopmail extras
('yopmail.pp.ua',            'disposable')  ,
-- YouMail
('youmailr.com',             'disposable')  ,
-- ZapMail
('zapmail.online',           'disposable')  ,
-- Zippymail
('zippymail.info',           'disposable')  ,
-- Zoaxe
('zoaxe.com',                'disposable')  ,
-- Zoemail
('zoemail.com',              'disposable')  ,
('zoemail.net',              'disposable')  ,
('zoemail.org',              'disposable')  ,
-- Zomg
('zomg.info',                'disposable')  
ON CONFLICT (email) DO NOTHING;
