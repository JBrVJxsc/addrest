# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a sample controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
#########################################################################
import time

def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    response.flash = T("Hello World")
    return dict(message=T('Welcome to web2py!'))


def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/manage_users (requires membership in
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


def dashboard():
    return dict()


def login():
    result = Auth(db=db).login_bare(request.vars.email, request.vars.password)
    # time.sleep(3)
    return locals()


def signup():
    print "vars:", request.vars
    print "args:", request.args
    result = Auth(db=db).register_bare(**request.vars)
    # time.sleep(3)
    return locals()


def logout():
    print "logging out."
    redirect(URL('default', 'user', args='logout'))


def boards():
    # is_logged_in = auth.is_logged_in()
    # time.sleep(1)
    print auth.user
    result = {
        'boards': [
            {
                'title': "Jobs",
                'recent': 6
            },
            {
                'title': "Housing",
                'recent': 12
            },
        ],
        'user': auth.user
    }
    return locals()
