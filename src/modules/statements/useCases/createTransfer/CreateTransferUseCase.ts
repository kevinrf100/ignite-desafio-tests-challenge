import { inject, injectable } from 'tsyringe';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementError } from '../createStatement/CreateStatementError';

interface IRequest {
  sender_id: string,
  amount: number,
  description: string,
  user_id: string,
  type: OperationType
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({sender_id, amount, description, user_id, type}: IRequest) {
    const user = await this.usersRepository.findById(sender_id);

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    const userToSend = await this.usersRepository.findById(user_id);

    if(!userToSend) {
      throw new CreateStatementError.UserNotFound();
    }

    const statement = await this.statementsRepository.create({amount, description, user_id, type})
  }
}
