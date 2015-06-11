/*
 * Copyright (c) 2014 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#ifndef __IOTKIT_H
#define __IOTKIT_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include "cJSON.h"
#include "util.h"
#include "rest.h"

#ifndef DEBUG
   #define DEBUG 0
#endif

#define BODY_SIZE_MIN 1024
#define BODY_SIZE_MED 4096
#define BODY_SIZE_MAX 12288

#define HTTP_PROTOCOL "http://"
#define HTTPS_PROTOCOL "https://"

#define HEADER_CONTENT_TYPE_NAME "Content-Type"
#define HEADER_CONTENT_TYPE_JSON "application/json"


#define HEADER_AUTHORIZATION "Authorization"
#define HEADER_AUTHORIZATION_BEARER "Bearer "

#define CURRENT_DIR "./"
#define DEFAULT_CONFIG_DIR "/etc/iotkit-lib/"
#define CONFIGURATION_FILE_NAME "config.json"
#define AUTHORIZATION_FILE_NAME "authorization.json"
#define DEVICE_CONFIG_FILE_NAME "device_config.json"
#define SENSOR_LIST_FILE_NAME "sensor-list.json"

/** Sensor list to hold sensors
*/
typedef struct _SensorComp {
    char *cid;
    char *name;
    char *type;

    struct _SensorComp *next;
} SensorComp;


typedef struct _Configurations {
    bool isSecure;

    char *base_url;

    char *data_account_id;
    char *data_account_name;
    char *device_id;

    // advanced data inquiry
    char *advanced_data_inquiry;

    // aggregated report interface
    char *aggregated_report_interface;

    // account management
    char *create_an_account;
    char *get_account_information;
    char *get_account_activation_code;
    char *renew_account_activation;
    char *update_an_account_name;
    char *delete_an_account_name;
    char *add_an_user_to_account;
    char *get_user_associated_with_account;
    char *update_user_associated_with_account;

    // account authorization
    char *authorization_key;
    char *authorization_key_expiry;
    char *user_account_id;
    char *new_auth_token;
    char *auth_token_info;
    char *me_info;

    // alert management
    char *create_new_alert;
    char *get_list_of_alerts;
    char *get_alert_information;
    char *reset_alert;
    char *update_alert_status;
    char *add_comment_to_alert;

    // component catalogs
    char *list_components;
    char *get_component_details;
    char *create_an_cmp_catalog;
    char *update_an_cmp_catalog;

    // device management
    char *list_all_devices;
    char *get_device_info;
    char *get_my_device_info;
    char *create_a_device;
    char *update_a_device;
    char *activate_a_device;
    char *activate_a_device2;
    char *delete_a_device;
    char *add_a_component;
    char *delete_a_component;
    char *deviceToken;
    char *list_all_tags_for_devices;
    char *list_all_attributes_for_devices;

    // invitation management
    char *get_list_of_invitation;
    char *get_invitation_list_send_to_specific_user;
    char *create_invitation;
    char *delete_invitations;

    // data api
    char *submit_data;
    char *retrieve_data;

    // rule management
    char *create_a_rule;
    char *update_a_rule;
    char *get_list_of_rules;
    char *get_one_rule_info;
    char *create_a_rule_as_draft;
    char *update_status_of_a_rule;
    char *delete_a_draft_rule;

    // user management
    char *create_a_user;
    char *get_user_information;
    char *update_user_attributes;
    char *accept_terms_and_conditions;
    char *delete_a_user;
    char *request_change_password;
    char *change_password;

    char *store_path; // path for json files
} Configurations;


/** Id list
*/
typedef struct _StringList {
    char *data;

    struct _StringList *next;
} StringList;

typedef struct _KeyValueParams {
    char *name;
    char *value;

    struct _KeyValueParams *next;
} KeyValueParams;

typedef struct _AttributeFilter {
    char *filterName;
    StringList *filterValues;

    struct _AttributeFilter * next;
} AttributeFilter;

typedef struct _AttributeFilterList {
    AttributeFilter * filterData;
    struct _AttributeFilterList *next;
} AttributeFilterList;


Configurations configurations;
SensorComp *sensorsList;

void parseConfiguration(char *config_file_path);
bool prepareUrl(char **full_url, char *url_prepend, char *url_append, KeyValueParams *urlParams);
char *getConfigAuthorizationToken();
//char * hello();

char *iotkit_get_version();
void iotkit_init();
void iotkit_cleanup();

KeyValueParams *createKeyValueParams(char *key, char *value);
void addKeyValueParams(KeyValueParams *params, char *key, char *value);
char *createHttpResponseJson(HttpResponse *response);

#ifdef __cplusplus
}
#endif

#endif
