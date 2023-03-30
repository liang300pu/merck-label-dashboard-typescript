# Merck Label Dashboard Developer Guide

In this developer guide, I will share some of the techniques and tips used in this project, as well as describe the core components of the client and server. At the end I will also talk about some possible areas of improvement and other libraries out there. This guide is intended to help new developers to this project understand how and why things work the way they do.

> Please see [this section](#3-points-of-improvement)

## Table of Contents

-   ### 0. [Foreword](#0-foreword-1)

-   ### 1. [Client](#1-client-1)

    -   1.1 [Redux](#11-redux)
    -   1.2 [Components](#12-components)
    -   1.3 [API Wrapper](#13-api-wrapper)
    -   1.4 [Annoyances](#14-annoyances)

-   ### 2. [Server](#2-server-1)

    -   2.1 [Database Information](#21-database)
        -   [Database Design & Constraints](#database-design-requirements)
        -   [The Schema](#the-schema)
    -   2.2 [API](#22-api)
    -   2.3 [Rasterizing Images](#23-rasterizing-images)
        -   2.3.1 [BrotherQL Raster Command Reference](https://download.brother.com/welcome/docp100278/cv_ql800_eng_raster_101.pdf) (External Lnk)
    -   2.4 [Environment Variables](#24-environment-variables)

-   ### 3. [Improvement / Future Goals](#3-points-of-improvement)

    -   3.1 [Issues with Redux](#31-problems-with-redux)
        -   3.1.1 [Possible fixes](#311-fixes-for-redux)
        -   3.1.2 [Other state management options](#312-other-state-management-options)
    -   3.2 [Component Organization and Reusability](#32-component-organization-and-reusability)
        -   3.2.1 [When to abstract a component](#321-when-to-abstract-a-component)
    -   3.3 [API Routes](#33-api-routes)
        -   3.3.1 [Do they make sense?](#331-do-they-make-sense)
        -   3.3.2 [How we can improve](#332-how-we-can-improve)
    -   3.4 [Rasterizing Images](#34-rasterizing-images)
        -   3.4.1 [Tip: find a library for it](#341-tip-find-a-library-for-it)
        -   3.4.2 [Pain: create a robust BrotherQL image rasterizer](#342-pain-create-a-robust-brotherql-image-rasterizer)
            -   [Current progress](#23-rasterizing-images)
    -   3.5 [Database Schema](#35-database-schema)
    -   3.6 [Label Editor](#36-label-editor)
        -   3.6.1 [Improvements](#361-improvements)
    -   3.7 [General Improvements, Bug Fixes, and Known Issues](#37-general-improvements-bug-fixes-and-known-issues)
        -   3.7.1 [General Improvements](#371-general-improvements)
        -   3.7.2 [Bug Fixes](#372-bug-fixes)
        -   3.7.3 [Known Issues](#373-known-problems)

## 0. **Foreword**

Hi

## 1. **Client**

### 1.1 **Redux**

We use `redux` to manage the global state of our applications. Currently we are not doing anything in regards to handling async state. Our action creators will return async dispatch functions but you cannot actually await the dispatch when calling it. More about this will be mentioned in the [Improvement / Future Goals](#3-points-of-improvement) section.

Here I will go over the steps for extending the redux store and adding more state. It is important to note that I am not the best at redux and don't know how everything works I just used it.

#### Step 1. **Action Types**

Action types are defined as enums in [action-types/index.ts][action-types-link]. They define what actions can be dispatched to the store. The action types are then used to define the actions and henceforth the action creators. Action types are usually defined for CRUD actions ("CREATE", "READ", "UPDATE", "DELETE"). Heres an example action type for the `samples` table:

```typescript
enum SampleActionType {
    FETCH_ALL = 'SAMPLE_FETCH_ALL',
    FETCH_TEAM = 'SAMPLE_FETCH_TEAM',
    CREATE = 'SAMPLE_CREATE',
}
```

You will notice that there is no `UPDATE` or `DELETE` action type. That is because the action creators for those return a dispatch that calls the API to update or delete then dispatches the `FETCH_ALL` action type to update the state.

#### Step 2. **Actions**

Actions consist of two components, a `type` and `payload`. The `type` is the action type defined in the previous step. The `payload` is the data that will be used to update the state. So, every possible action type will have its own action. For the action type defined above there would be three actions. The actions are defined in [actions/index.ts][actions-link]. Here is an example action for the `FETCH_ALL` action type defined by `SampleActionType`:

```typescript
export interface FetchAllSamplesAction {
    type: SampleActionType.FETCH_ALL
    payload: {
        [key: string]: Sample[]
    }
}
```

#### Step 3. **Action Creators**

Action creators are functions that take in some argument and create a dispatch function for an action. For example we pass in a team name to an action creator for fetching a teams samples, and it will return a dispatch function that when dispatched, fetches all the samples for that team and updates our store. All of our action creators are defined in [action-creators/index.ts][action-creators-link]. Below is the implementation of the action creator mentioned above:

```typescript
export const fetchTeamsSamples = (team: string) => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const samples = await api.getTeamSamples(team)

        dispatch({
            type: SampleActionType.FETCH_TEAM,
            payload: {
                team,
                samples,
            },
        })
    }
}
```

With this example you can see everything come together from the previous two steps. We are able to type our dispatch function with the action created in [step 2](#step-2-actions) and use our action type from [step 1](#step-1-action-types). Doing the previous to steps allows us to get full type information about what we are dispatching, this not only helps us make sure we are passing the correct data, but helps future developers.

#### Step 4. **Reducers**

Reducers are going to incercept dispatch actions and figure what to do with that new data in relation to the current state. For example, when the function returned fetchTeamsSamples action creator from above calls dispatch, our reducer will get called with the current state and the action as arguments. Our reducer then needs to manipulate the state differently based on the action type. Below you can see the code for the samples reducer:

```typescript
import { SampleAction } from '../actions'
import { SampleActionType } from '../action-types'
import { Sample } from '../../api/types'

const reducer = (
    state: Record<string, Sample[]> = {},
    action: SampleAction
): { [key: string]: Sample[] } => {
    switch (action.type) {
        case SampleActionType.FETCH_ALL:
            return action.payload
        case SampleActionType.FETCH_TEAM:
            return {
                ...state,
                [action.payload.team]: action.payload.samples,
            }
        case SampleActionType.CREATE:
            return {
                ...state,
                [action.payload.team]: [
                    ...state.samples[action.payload.team],
                    action.payload.sample,
                ],
            }
        default:
            return state
    }
}

export default reducer
```

As mentioned previously, our reducer takes two arguments, the samples slice of the global state and the action that was dispatched. The reducer should return the new slice of state. In the case of the FETCH_TEAM action type, we return the previous state, and only update the samples for the team that we fetched in the action.

#### Step 5 **Combining Reducers**

Once we've finished our reducer, the last step is to combine it with all our other reducers.

```typescript
import { combineReducers } from 'redux'

import samplesReducer from './sampleReducer'
import deletedSamplesReducer from './deletedSamplesReducer'
import teamReducer from './teamReducer'
import teamsReducer from './teamsReducer'
import printersReducer from './printerReducer'
import fieldsReducer from './fieldsReducer'
import labelsReducer from './labelsReducer'

const reducers = combineReducers({
    printers: printersReducer,
    samples: samplesReducer,
    deletedSamples: deletedSamplesReducer,
    team: teamReducer,
    teams: teamsReducer,
    fields: fieldsReducer,
    labels: labelsReducer,
})

export default reducers

export type SampleState = ReturnType<typeof samplesReducer>
export type TeamState = ReturnType<typeof teamReducer>
export type PrinterState = ReturnType<typeof printersReducer>
export type TeamsState = ReturnType<typeof teamsReducer>
export type FieldsState = ReturnType<typeof fieldsReducer>

export type State = ReturnType<typeof reducers>
```

Here we combine all of our reducers and export some type definitions for each slice of state. You may have noticed I was using the term slice earlier, and that just refers to a portion of the global state that a reducer handles. For example, the samples reducers only has access to the samples state.

### 1.2 **Components**

### 1.3 **API Wrapper**

### 1.4 **Annoyances**

## 2. **Server**

### 2.1 **Database**

We support any database of your choice as long as `Prisma` supports it. Chaniging the provider will most likely cause errors in the schema that you will have to resolve so keep that in mind. By default we use `postgresql` as our database provider. I recommend taking a look at [prisma datasources](https://www.prisma.io/docs/concepts/components/prisma-schema/data-sources) and [prisma database connectors](https://www.prisma.io/docs/concepts/database-connectors) for additional information.

#### **Database Design Requirements**

Due to Merck specifications we are not allowed to delete or modify any samples from the `samples` table. There are two areas where this causes issues, editing an deleting samples. Without editing or deleting it becomes a challenge to keep track of which samples are still active and which samples is the most recent version of itself.

##### **How we "Edit" Samples**

When a sample is "edited" a new sample is created in the `samples` table with the new sample information. The `audit_id` of the new sample is the same as the `audit_id` of the old sample. This, combined with the `audit_number` allows us to keep track of which samples are the most recent version of themselves. The `audit_number` is a `KSUID`, an ID that has a component of time baked into it, so we can easily sort a list of samples with the same `audit_id` by their `audit_number` and get the most recent version of a sample.

> Link to the [KSUID npm package](https://www.npmjs.com/package/ksuid)

##### **How we "Delete" Samples**

To simulate the deletion process we have two tables, `samples`, and `deleted_samples`. `samples` stores every single sample, whether its been deleted or currently in use. `deleted_samples` stores the `audit_id`, and `team_name` of a sample that was deleted. To filter out all non-deleted samples we simply check if the `audit_id` of the sample we are currently checking is not in the `deleted_samples` table. Although this may seem like a hassle, this approach does allow us to easily fetch the `audit_id`s of every deleted sample as a bonus.

#### **The Schema**

Well, I do have to say that I am not too happy with the current state of the schema and database design but it works. But, I digress, and will explain thought process behind each part of the schema below.

I will not be copy pasting the contents of the prisma schema here. Please see [schema.prisma][schema-link]

##### **Teams**

Every piece of data in this project can be traced back to a team. They are the most fundamental piece of information, without any teams it is impossible to manage other pieces of data. Teams are extremely important for identifying and separating samples into their respective teams. They also allow for the "infinite growth" of this project. As new teams or departments express interest in a project like this, it becomes very easy to add them as a team and everything else will be taken care of.

##### **Fields**

Fields are closely realated to teams as they define what specific information that a team wants to store about a sample. They also work closely with samples as a teams fields define what keys you can expect to live in a samples (from that team) `data` field. This means that teams can add and remove fields as they please and samples can reflect those changes. It is important to note that since fields can come and go as they please, older and newer samples may be missing or have extra fields. This is not a problem as we only display the fields that are currently present in the `fields` table but it is important to know.

##### **Samples**

Samples are the main piece of data we store. Scientists are constantly creating, deleting, and editing samples. And the way we store them is pretty simple. Every sample has these 8 properties: `id`, `audit_id`, `audit_number`, `date_created`, `date_modified`, `expiration_date`, `team_name`, and `data`. Each sample is defined in a very generic manner, but the flexibility comes with the `data` field. The `data` field is stored as a JSON object and has keys that are mostly equivalent to those defined in the `fields` table. The reason I say mostly equivalent is because, as the `fields` are updated, older samples are not updated to include those fields. The current way to deal with that is display missing `fields` in a sample as `N/A`.

##### **Printers**

The printers table is very simple, we just store an `ip`, `name`, and `location` of each printer. It's important to keep track of each printers IP as it is what we use to send over the raster data via `IPP`.

##### **Labels**

The labels table stores the designs for specific labels. These designs are generated by the label editor. They can be parsed into actual images, given a sample, and then sent to the printer. In the schema you will notice a field of `data` with type `JSON`. This is where we store the locations and attributes (size, bold, italic) of text and the qr code for the label. This is the data that is used to generate the image. If text is found that contains a samples field surrounded by brackets like this `{sample_name}` then the text will be replaced with the value of that field in the sample. If the field is not found in the sample then the text will be replaced with `N/A`.

### 2.2 **API**

Please see [API.md][api-def-link]

### 2.3 **Rasterizing Images**

This is definetely the most complex and annoying, but integral, part of this project.

#### 2.3.1 [BrotherQL Raster Command Reference](https://download.brother.com/welcome/docp100278/cv_ql800_eng_raster_101.pdf)

### 2.4 **Environment Variables**

There are a couple environment variables that should be set by you so that things are working properly. These should be in a `.env` which is direct child of the `server` folder.

### **Database**

#### **DB_URI**

The `DB_URI` is the connection string to the database of your choice. The choice of database is up to you as long as `Prisma` can support it. By default we have set `Prisma` to use `postgresql`.

`.env`

> DB_URI=postgreqsql://user:password@host:port/database-name

### **Emailing**

To get the automatic emailing setup you will need to set three environment variables.

-   EMAIL_USER
-   EMAIL_PASSWORD
-   DEFAULT_EMAIL_TARGET

#### **`EMAIL_USER`**

This is the email address of the account that will send the emails.

`.env`

> EMAIL_USER=my_email@gmail.com

#### **`EMAIL_PASSWORD`**

This is the app password for the email account specified for `EMAIL_USER`. This is not the password to your email account.

For gmail users you can generate an app password by going to `https://myaccount.google.com/` in a browser where you are logged into your gmail account. Then, once you have 2-Factor authentication setup, you can generate an app password and set the environment variable.

`.env`

> EMAIL_PASSWORD=aj18xlaieo10

#### **`DEFAULT_EMAIL_TARGET`**

By default, we attempt to resolve the targets email by looking for the `isid` key in a samples `data` field. If none is found, we fallback to this environment variables value. It is probably more feasible to add `isid` as a required key in the `sample` schema.

The code that actually implements this is as follows

```typescript
let emailTarget = process.env.DEFAULT_EMAIL_TARGET
if (sample.data && sample.data.hasOwnProperty('isid')) {
    emailTarget = `${sample.data['isid']}@merck.com`
}
```

`.env`

> DEFAULT_EMAIL_TARGET=ardscientists@merck.com

## 3. **Points of Improvement**

A lot of the points will be opionated or based on my personal experience while working on this project. I will _attempt_ to give recommendaitons for how to improve the project.

-   Components
    -   Some are uselessly abstracted. I would like to switch to the paradigm that if we want to abstract a component for single use, do it in the same file. If you re use it across multiple files then it can get its own directory/file in the `components` folder.
    -   Also, I know that the samples table component should be abstracted because I copy-pasted it for the sample audit table and deleted samples table with some changes. I would like to fix that.

### 3.1 **Problems with Redux**

The main problem I have with redux is the amount of code needed to add new state. First you have to define your action types, then you can make your actions, then action creators, and finally reducers. Although order may vary there are a lot of steps to implementing new state into the app. It also makes it very difficult to maintain and keep track of where specific state information is stored. I also found it difficult to manage async state such as api requests. Although, that was due to my lack of experience with redux, and not knowing the powers of redux toolkit.

#### 3.1.1 **Fixes for Redux**

-   [Redux Toolkit](https://redux-toolkit.js.org/usage/usage-guide) and [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
    -   This will drastically improve the amount of code need to add new state and reduce the current amount of boilerplate code.
    -   Redux Toolkit is already being used in this project, but not to the best of its ability. Using [slices](https://redux-toolkit.js.org/usage/usage-guide#simplifying-slices-with-createslice) can drastically reduce the amount of code needed to scaffold a new piece of state. Please be sure to also read about the down side of using slices mentioned in the `slices` link above.
    -   In terms of RTK Query I can't provide much input. From what little I've read on their docs it seems that it could replace our `api` folder and make writing new api calls much easier. I would recommend reading the docs and seeing if it is a good fit for this project.

#### 3.1.2 **Other State Management Options**

-   [Zustand](https://github.com/pmndrs/zustand)
    -   Although I haven't personally used it I hear a lot of people talking about it. "A small, fast and scalable bearbones state-management solution using simplified flux principles. Has a comfy API based on hooks, isn't boilerplatey or opinionated" - Zustand GitHub.
-   [XState](https://xstate.js.org/docs/)
    -   I have only recently head of XState, but im pretty sure its been around for a while. It seems to be a very powerful state management tool. It is based on the concept of finite state machines.
-   Remarks
    -   State management is a very opionated topic and I am certainly no expert. But, at the end of the day it comes down to whats the best fit for the project and developer experience. It's always good to explore the many options out there but can be difficult to pick the "perfect" one without actually using it.

### 3.2 **Component Organization and Reusability**

#### 3.2.1 **When to abstract a component**

### 3.3 **API Routes**

#### 3.3.1 **Do they make sense?**

#### 3.3.2 **How we can improve**

### 3.4 **Rasterizing images**

#### 3.4.1 **Tip: find a library for it**

#### 3.4.2 **Pain: create a robust BrotherQL image rasterizer**

### 3.5 **Database Schema**

### 3.6 **Label Editor**

#### 3.6.1 **Improvements**

### 3.7 **General Improvements, Bug Fixes, and Known Issues**

#### 3.7.1 **General Improvements**

#### 3.7.2 **Bug Fixes**

#### 3.7.3 **Known Issues**

[schema-link]: /server/prisma/schema.prisma 'schema.prisma'
[api-def-link]: /server/API.md 'API.md'
[rasterizer-link]: /server/src/brother/raster.ts 'raster.ts'
[action-types-link]: /client/src/redux/action-types/index.ts 'action-types/index.ts'
[actions-link]: /client/src/redux/actions/index.ts 'actions/index.ts'
[action-creators-link]: /client/src/redux/action-creators/index.ts 'action-creators/index.ts'
