/* Generated by dbus-binding-tool; do not edit! */

#include <glib.h>
#include <dbus/dbus-glib.h>

G_BEGIN_DECLS

#ifndef _DBUS_GLIB_ASYNC_DATA_FREE
#define _DBUS_GLIB_ASYNC_DATA_FREE
static
#ifdef G_HAVE_INLINE
inline
#endif
void
_dbus_glib_async_data_free (gpointer stuff)
{
	g_slice_free (DBusGAsyncData, stuff);
}
#endif

#ifndef DBUS_GLIB_CLIENT_WRAPPERS_org_freedesktop_DBus_Introspectable
#define DBUS_GLIB_CLIENT_WRAPPERS_org_freedesktop_DBus_Introspectable

static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_Introspectable_introspect (DBusGProxy *proxy, char ** OUT_data, GError **error)

{
  return dbus_g_proxy_call (proxy, "Introspect", error, G_TYPE_INVALID, G_TYPE_STRING, OUT_data, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_Introspectable_introspect_reply) (DBusGProxy *proxy, char * OUT_data, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_Introspectable_introspect_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  char * OUT_data;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_STRING, &OUT_data, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_Introspectable_introspect_reply)data->cb) (proxy, OUT_data, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_Introspectable_introspect_async (DBusGProxy *proxy, org_freedesktop_DBus_Introspectable_introspect_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "Introspect", org_freedesktop_DBus_Introspectable_introspect_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_INVALID);
}
#endif /* defined DBUS_GLIB_CLIENT_WRAPPERS_org_freedesktop_DBus_Introspectable */

#ifndef DBUS_GLIB_CLIENT_WRAPPERS_org_freedesktop_DBus
#define DBUS_GLIB_CLIENT_WRAPPERS_org_freedesktop_DBus

static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_request_name (DBusGProxy *proxy, const char * IN_arg0, const guint IN_arg1, guint* OUT_arg2, GError **error)

{
  return dbus_g_proxy_call (proxy, "RequestName", error, G_TYPE_STRING, IN_arg0, G_TYPE_UINT, IN_arg1, G_TYPE_INVALID, G_TYPE_UINT, OUT_arg2, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_request_name_reply) (DBusGProxy *proxy, guint OUT_arg2, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_request_name_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  guint OUT_arg2;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_UINT, &OUT_arg2, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_request_name_reply)data->cb) (proxy, OUT_arg2, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_request_name_async (DBusGProxy *proxy, const char * IN_arg0, const guint IN_arg1, org_freedesktop_DBus_request_name_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "RequestName", org_freedesktop_DBus_request_name_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_UINT, IN_arg1, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_release_name (DBusGProxy *proxy, const char * IN_arg0, guint* OUT_arg1, GError **error)

{
  return dbus_g_proxy_call (proxy, "ReleaseName", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_UINT, OUT_arg1, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_release_name_reply) (DBusGProxy *proxy, guint OUT_arg1, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_release_name_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  guint OUT_arg1;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_UINT, &OUT_arg1, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_release_name_reply)data->cb) (proxy, OUT_arg1, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_release_name_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_release_name_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "ReleaseName", org_freedesktop_DBus_release_name_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_start_service_by_name (DBusGProxy *proxy, const char * IN_arg0, const guint IN_arg1, guint* OUT_arg2, GError **error)

{
  return dbus_g_proxy_call (proxy, "StartServiceByName", error, G_TYPE_STRING, IN_arg0, G_TYPE_UINT, IN_arg1, G_TYPE_INVALID, G_TYPE_UINT, OUT_arg2, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_start_service_by_name_reply) (DBusGProxy *proxy, guint OUT_arg2, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_start_service_by_name_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  guint OUT_arg2;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_UINT, &OUT_arg2, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_start_service_by_name_reply)data->cb) (proxy, OUT_arg2, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_start_service_by_name_async (DBusGProxy *proxy, const char * IN_arg0, const guint IN_arg1, org_freedesktop_DBus_start_service_by_name_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "StartServiceByName", org_freedesktop_DBus_start_service_by_name_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_UINT, IN_arg1, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_hello (DBusGProxy *proxy, char ** OUT_arg0, GError **error)

{
  return dbus_g_proxy_call (proxy, "Hello", error, G_TYPE_INVALID, G_TYPE_STRING, OUT_arg0, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_hello_reply) (DBusGProxy *proxy, char * OUT_arg0, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_hello_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  char * OUT_arg0;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_STRING, &OUT_arg0, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_hello_reply)data->cb) (proxy, OUT_arg0, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_hello_async (DBusGProxy *proxy, org_freedesktop_DBus_hello_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "Hello", org_freedesktop_DBus_hello_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_name_has_owner (DBusGProxy *proxy, const char * IN_arg0, gboolean* OUT_arg1, GError **error)

{
  return dbus_g_proxy_call (proxy, "NameHasOwner", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_BOOLEAN, OUT_arg1, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_name_has_owner_reply) (DBusGProxy *proxy, gboolean OUT_arg1, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_name_has_owner_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  gboolean OUT_arg1;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_BOOLEAN, &OUT_arg1, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_name_has_owner_reply)data->cb) (proxy, OUT_arg1, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_name_has_owner_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_name_has_owner_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "NameHasOwner", org_freedesktop_DBus_name_has_owner_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_list_names (DBusGProxy *proxy, char *** OUT_arg0, GError **error)

{
  return dbus_g_proxy_call (proxy, "ListNames", error, G_TYPE_INVALID, G_TYPE_STRV, OUT_arg0, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_list_names_reply) (DBusGProxy *proxy, char * *OUT_arg0, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_list_names_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  char ** OUT_arg0;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_STRV, &OUT_arg0, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_list_names_reply)data->cb) (proxy, OUT_arg0, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_list_names_async (DBusGProxy *proxy, org_freedesktop_DBus_list_names_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "ListNames", org_freedesktop_DBus_list_names_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_list_activatable_names (DBusGProxy *proxy, char *** OUT_arg0, GError **error)

{
  return dbus_g_proxy_call (proxy, "ListActivatableNames", error, G_TYPE_INVALID, G_TYPE_STRV, OUT_arg0, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_list_activatable_names_reply) (DBusGProxy *proxy, char * *OUT_arg0, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_list_activatable_names_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  char ** OUT_arg0;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_STRV, &OUT_arg0, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_list_activatable_names_reply)data->cb) (proxy, OUT_arg0, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_list_activatable_names_async (DBusGProxy *proxy, org_freedesktop_DBus_list_activatable_names_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "ListActivatableNames", org_freedesktop_DBus_list_activatable_names_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_add_match (DBusGProxy *proxy, const char * IN_arg0, GError **error)

{
  return dbus_g_proxy_call (proxy, "AddMatch", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_add_match_reply) (DBusGProxy *proxy, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_add_match_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_add_match_reply)data->cb) (proxy, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_add_match_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_add_match_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "AddMatch", org_freedesktop_DBus_add_match_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_remove_match (DBusGProxy *proxy, const char * IN_arg0, GError **error)

{
  return dbus_g_proxy_call (proxy, "RemoveMatch", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_remove_match_reply) (DBusGProxy *proxy, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_remove_match_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_remove_match_reply)data->cb) (proxy, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_remove_match_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_remove_match_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "RemoveMatch", org_freedesktop_DBus_remove_match_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_get_name_owner (DBusGProxy *proxy, const char * IN_arg0, char ** OUT_arg1, GError **error)

{
  return dbus_g_proxy_call (proxy, "GetNameOwner", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_STRING, OUT_arg1, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_get_name_owner_reply) (DBusGProxy *proxy, char * OUT_arg1, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_get_name_owner_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  char * OUT_arg1;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_STRING, &OUT_arg1, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_get_name_owner_reply)data->cb) (proxy, OUT_arg1, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_get_name_owner_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_get_name_owner_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "GetNameOwner", org_freedesktop_DBus_get_name_owner_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_list_queued_owners (DBusGProxy *proxy, const char * IN_arg0, char *** OUT_arg1, GError **error)

{
  return dbus_g_proxy_call (proxy, "ListQueuedOwners", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_STRV, OUT_arg1, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_list_queued_owners_reply) (DBusGProxy *proxy, char * *OUT_arg1, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_list_queued_owners_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  char ** OUT_arg1;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_STRV, &OUT_arg1, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_list_queued_owners_reply)data->cb) (proxy, OUT_arg1, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_list_queued_owners_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_list_queued_owners_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "ListQueuedOwners", org_freedesktop_DBus_list_queued_owners_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_get_connection_unix_user (DBusGProxy *proxy, const char * IN_arg0, guint* OUT_arg1, GError **error)

{
  return dbus_g_proxy_call (proxy, "GetConnectionUnixUser", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_UINT, OUT_arg1, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_get_connection_unix_user_reply) (DBusGProxy *proxy, guint OUT_arg1, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_get_connection_unix_user_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  guint OUT_arg1;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_UINT, &OUT_arg1, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_get_connection_unix_user_reply)data->cb) (proxy, OUT_arg1, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_get_connection_unix_user_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_get_connection_unix_user_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "GetConnectionUnixUser", org_freedesktop_DBus_get_connection_unix_user_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_get_connection_unix_process_id (DBusGProxy *proxy, const char * IN_arg0, guint* OUT_arg1, GError **error)

{
  return dbus_g_proxy_call (proxy, "GetConnectionUnixProcessID", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, G_TYPE_UINT, OUT_arg1, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_get_connection_unix_process_id_reply) (DBusGProxy *proxy, guint OUT_arg1, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_get_connection_unix_process_id_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  guint OUT_arg1;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_UINT, &OUT_arg1, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_get_connection_unix_process_id_reply)data->cb) (proxy, OUT_arg1, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_get_connection_unix_process_id_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_get_connection_unix_process_id_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "GetConnectionUnixProcessID", org_freedesktop_DBus_get_connection_unix_process_id_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_get_connection_se_linux_security_context (DBusGProxy *proxy, const char * IN_arg0, GArray** OUT_arg1, GError **error)

{
  return dbus_g_proxy_call (proxy, "GetConnectionSELinuxSecurityContext", error, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID, dbus_g_type_get_collection ("GArray", G_TYPE_UCHAR), OUT_arg1, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_get_connection_se_linux_security_context_reply) (DBusGProxy *proxy, GArray *OUT_arg1, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_get_connection_se_linux_security_context_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  GArray* OUT_arg1;
  dbus_g_proxy_end_call (proxy, call, &error, dbus_g_type_get_collection ("GArray", G_TYPE_UCHAR), &OUT_arg1, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_get_connection_se_linux_security_context_reply)data->cb) (proxy, OUT_arg1, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_get_connection_se_linux_security_context_async (DBusGProxy *proxy, const char * IN_arg0, org_freedesktop_DBus_get_connection_se_linux_security_context_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "GetConnectionSELinuxSecurityContext", org_freedesktop_DBus_get_connection_se_linux_security_context_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_STRING, IN_arg0, G_TYPE_INVALID);
}
static
#ifdef G_HAVE_INLINE
inline
#endif
gboolean
org_freedesktop_DBus_reload_config (DBusGProxy *proxy, GError **error)

{
  return dbus_g_proxy_call (proxy, "ReloadConfig", error, G_TYPE_INVALID, G_TYPE_INVALID);
}

typedef void (*org_freedesktop_DBus_reload_config_reply) (DBusGProxy *proxy, GError *error, gpointer userdata);

static void
org_freedesktop_DBus_reload_config_async_callback (DBusGProxy *proxy, DBusGProxyCall *call, void *user_data)
{
  DBusGAsyncData *data = (DBusGAsyncData*) user_data;
  GError *error = NULL;
  dbus_g_proxy_end_call (proxy, call, &error, G_TYPE_INVALID);
  (*(org_freedesktop_DBus_reload_config_reply)data->cb) (proxy, error, data->userdata);
  return;
}

static
#ifdef G_HAVE_INLINE
inline
#endif
DBusGProxyCall*
org_freedesktop_DBus_reload_config_async (DBusGProxy *proxy, org_freedesktop_DBus_reload_config_reply callback, gpointer userdata)

{
  DBusGAsyncData *stuff;
  stuff = g_slice_new (DBusGAsyncData);
  stuff->cb = G_CALLBACK (callback);
  stuff->userdata = userdata;
  return dbus_g_proxy_begin_call (proxy, "ReloadConfig", org_freedesktop_DBus_reload_config_async_callback, stuff, _dbus_glib_async_data_free, G_TYPE_INVALID);
}
#endif /* defined DBUS_GLIB_CLIENT_WRAPPERS_org_freedesktop_DBus */

G_END_DECLS
