import { inject, injectable } from 'tsyringe';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType, Statement } from '../../entities/Statement';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementError } from '../createStatement/CreateStatementError';
import { CreateTransferError } from './CreateTransferError';

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

  async execute({sender_id, amount, description, user_id, type}: IRequest): Promise<Statement> {
    const user = await this.usersRepository.findById(sender_id);

    if(!user) {
      throw new CreateTransferError.UserNotFound();
    }

    const userToSend = await this.usersRepository.findById(user_id);

    if(!userToSend) {
      throw new CreateTransferError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if(amount > balance) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const statement = await this.statementsRepository.create({amount, description, user_id, type, sender_id});

    return statement;
  }
}
