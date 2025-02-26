/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonar/sonar-max-lines-per-function */

import { ServiceId } from "@pagopa/io-functions-commons/dist/generated/definitions/ServiceId";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { toCosmosErrorResponse } from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";
import {
  aRetrievedService,
  aSeralizedService,
  aServicePayload
} from "../../__mocks__/mocks";
import { apiServiceToService } from "../../utils/conversions";
import { UpdateServiceHandler } from "../handler";

const aDepartmentName = "UpdateDept" as NonEmptyString;
const anUpdatedApiService = apiServiceToService({
  ...aServicePayload,
  department_name: aDepartmentName
});

const leftErrorFn = jest.fn(() => {
  return TE.left(toCosmosErrorResponse({ kind: "COSMOS_ERROR_RESPONSE" }));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UpdateServiceHandler", () => {
  it("should return a validation error and not update the service if the serviceid in the payload is not equal to the serviceid in the path", async () => {
    const aServiceId = "DifferentSubscriptionId" as ServiceId;
    const serviceModelMock = {
      findOneByServiceId: jest.fn(() => {
        return TE.right(O.some(aRetrievedService));
      }),
      upsert: jest.fn(() =>
        TE.right(
          O.some({
            ...aRetrievedService,
            ...anUpdatedApiService
          })
        )
      )
    };

    const updateServiceHandler = UpdateServiceHandler(serviceModelMock as any);

    const response = await updateServiceHandler(
      undefined as any, // Not used
      undefined as any, // Not used
      aServiceId,
      {
        ...aServicePayload,
        department_name: aDepartmentName
      }
    );

    expect(serviceModelMock.findOneByServiceId).not.toHaveBeenCalled();
    expect(serviceModelMock.upsert).not.toHaveBeenCalled();
    expect(response.kind).toBe("IResponseErrorValidation");
  });

  it("should return a query error if an error occurs trying to retrive the service with the requested id", async () => {
    const serviceModelMock = {
      findOneByServiceId: leftErrorFn
    };

    const updateServiceHandler = UpdateServiceHandler(serviceModelMock as any);

    const response = await updateServiceHandler(
      undefined as any, // Not used
      undefined as any, // Not used
      aServicePayload.service_id,
      {
        ...aServicePayload,
        department_name: aDepartmentName
      }
    );

    expect(serviceModelMock.findOneByServiceId).toHaveBeenCalledWith(
      aRetrievedService.serviceId
    );
    expect(response.kind).toBe("IResponseErrorQuery");
  });

  it("should return a not found error if the service with the requested serviceid is not found", async () => {
    const serviceModelMock = {
      findOneByServiceId: jest.fn(() => {
        return TE.right(O.none);
      })
    };

    const updateServiceHandler = UpdateServiceHandler(serviceModelMock as any);

    const response = await updateServiceHandler(
      undefined as any, // Not used
      undefined as any, // Not used
      aServicePayload.service_id,
      {
        ...aServicePayload,
        department_name: aDepartmentName
      }
    );

    expect(serviceModelMock.findOneByServiceId).toHaveBeenCalledWith(
      aRetrievedService.serviceId
    );
    expect(response.kind).toBe("IResponseErrorNotFound");
  });

  it("should return a query error if the exixting service fails to be updated", async () => {
    const serviceModelMock = {
      findOneByServiceId: jest.fn(() => {
        return TE.right(O.some(aRetrievedService));
      }),
      update: leftErrorFn
    };

    const updateServiceHandler = UpdateServiceHandler(serviceModelMock as any);

    const response = await updateServiceHandler(
      undefined as any, // Not used
      undefined as any, // Not used
      aServicePayload.service_id,
      {
        ...aServicePayload,
        department_name: aDepartmentName
      }
    );

    expect(serviceModelMock.findOneByServiceId).toHaveBeenCalledWith(
      aRetrievedService.serviceId
    );
    expect(serviceModelMock.update).toHaveBeenCalledTimes(1);
    expect(response.kind).toBe("IResponseErrorQuery");
  });

  it("should update an existing service using the payload and return the updated service", async () => {
    const serviceModelMock = {
      findOneByServiceId: jest.fn(() => {
        return TE.right(O.some(aRetrievedService));
      }),
      update: jest.fn(() =>
        TE.right({
          ...aRetrievedService,
          ...anUpdatedApiService
        })
      )
    };

    const updateServiceHandler = UpdateServiceHandler(serviceModelMock as any);

    const response = await updateServiceHandler(
      undefined as any, // Not used
      undefined as any, // Not used
      aServicePayload.service_id,
      {
        ...aServicePayload,
        department_name: aDepartmentName
      }
    );

    expect(serviceModelMock.findOneByServiceId).toHaveBeenCalledWith(
      aRetrievedService.serviceId
    );
    expect(serviceModelMock.update).toHaveBeenCalledTimes(1);
    expect(response.kind).toBe("IResponseSuccessJson");
    if (response.kind === "IResponseSuccessJson") {
      expect(response.value).toEqual({
        ...aSeralizedService,
        department_name: aDepartmentName
      });
    }
  });
});
