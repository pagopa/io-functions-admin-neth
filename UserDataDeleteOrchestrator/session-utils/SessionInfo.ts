/**
 * Do not edit this file it is auto-generated by italia-utils / gen-api-models.
 * See https://github.com/teamdigitale/italia-utils
 */
/* tslint:disable */

import { Timestamp } from "./Timestamp";
import * as t from "io-ts";

/**
 * Decribe a session of an authenticated user.
 */

// required attributes
const SessionInfoR = t.interface({
  createdAt: Timestamp,

  sessionToken: t.string
});

// optional attributes
const SessionInfoO = t.partial({});

export const SessionInfo = t.exact(
  t.intersection([SessionInfoR, SessionInfoO], "SessionInfo")
);

export type SessionInfo = t.TypeOf<typeof SessionInfo>;
