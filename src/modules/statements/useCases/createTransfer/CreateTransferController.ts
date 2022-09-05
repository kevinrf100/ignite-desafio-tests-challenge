import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { OperationType } from '../../entities/Statement';

import { CreateTransferUseCase } from './CreatetransferUseCase';

export class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    createTransferUseCase.execute({sender_id, amount, description, user_id ,type: OperationType.TRANSFER});

    return response.json();
  }
}