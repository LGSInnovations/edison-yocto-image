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

#ifndef __COMPONENT_CATALOG_H
#define __COMPONENT_CATALOG_H

#ifdef __cplusplus
extern "C" {
#endif

#include "iotkit.h"

/** Actuator Command list
*/
typedef struct _ActuatorCommandParams {
    char *name;
    char *value;

    struct _ActuatorCommandParams *next;
} ActuatorCommandParams;

typedef struct _ComponentCatalog {
    char *name;
    char *version;
    char *type;
    char *datatype;
    char *format;
    bool isMinPresent;
    double minvalue;
    bool isMaxPresent;
    double maxvalue;
    char *unit;
    char *display;
    char *command;

    ActuatorCommandParams *parameters;
} ComponentCatalog;

char *listAllComponentCatalogs();
char *getComponentCatalogDetails(char *cmp_id);
ComponentCatalog *createComponentCatalogObject(char *cmp_name, char *cmp_version, char *cmp_type, char *cmp_datatype, \
            char *cmp_format, char *cmp_unit, char *cmp_display);
ComponentCatalog *addMinValue(ComponentCatalog *cmpCatalogObject, double cmp_minvalue);
ComponentCatalog *addMaxValue(ComponentCatalog *cmpCatalogObject, double cmp_maxvalue);
ComponentCatalog *addCommandString(ComponentCatalog *cmpCatalogObject, char *cmp_command);
ComponentCatalog *addCommandParams(ComponentCatalog *cmpCatalogObject, char *cmd_name, char *cmd_value);

char *createAnComponentCatalog(ComponentCatalog *cmpCatalogObject);
char *updateAnComponentCatalog(ComponentCatalog *cmpCatalogObject, char *cmp_id);

#ifdef __cplusplus
}
#endif

#endif
