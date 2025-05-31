from django.views import View
from django.http import HttpResponse


class IndexAPIView(View):

    def get(self, request):
        return HttpResponse(
            """                                                                                                                                                                                                                                            
   SSSSSSSSSSSSSSS              AAA               KKKKKKKKK    KKKKKKK               AAA               HHHHHHHHH     HHHHHHHHH               AAA               NNNNNNNN        NNNNNNNN                    AAA               PPPPPPPPPPPPPPPPP   IIIIIIIIII
 SS:::::::::::::::S            A:::A              K:::::::K    K:::::K              A:::A              H:::::::H     H:::::::H              A:::A              N:::::::N       N::::::N                   A:::A              P::::::::::::::::P  I::::::::I
S:::::SSSSSS::::::S           A:::::A             K:::::::K    K:::::K             A:::::A             H:::::::H     H:::::::H             A:::::A             N::::::::N      N::::::N                  A:::::A             P::::::PPPPPP:::::P I::::::::I
S:::::S     SSSSSSS          A:::::::A            K:::::::K   K::::::K            A:::::::A            HH::::::H     H::::::HH            A:::::::A            N:::::::::N     N::::::N                 A:::::::A            PP:::::P     P:::::PII::::::II
S:::::S                     A:::::::::A           KK::::::K  K:::::KKK           A:::::::::A             H:::::H     H:::::H             A:::::::::A           N::::::::::N    N::::::N                A:::::::::A             P::::P     P:::::P  I::::I  
S:::::S                    A:::::A:::::A            K:::::K K:::::K             A:::::A:::::A            H:::::H     H:::::H            A:::::A:::::A          N:::::::::::N   N::::::N               A:::::A:::::A            P::::P     P:::::P  I::::I  
 S::::SSSS                A:::::A A:::::A           K::::::K:::::K             A:::::A A:::::A           H::::::HHHHH::::::H           A:::::A A:::::A         N:::::::N::::N  N::::::N              A:::::A A:::::A           P::::PPPPPP:::::P   I::::I  
  SS::::::SSSSS          A:::::A   A:::::A          K:::::::::::K             A:::::A   A:::::A          H:::::::::::::::::H          A:::::A   A:::::A        N::::::N N::::N N::::::N             A:::::A   A:::::A          P:::::::::::::PP    I::::I  
    SSS::::::::SS       A:::::A     A:::::A         K:::::::::::K            A:::::A     A:::::A         H:::::::::::::::::H         A:::::A     A:::::A       N::::::N  N::::N:::::::N            A:::::A     A:::::A         P::::PPPPPPPPP      I::::I  
       SSSSSS::::S     A:::::AAAAAAAAA:::::A        K::::::K:::::K          A:::::AAAAAAAAA:::::A        H::::::HHHHH::::::H        A:::::AAAAAAAAA:::::A      N::::::N   N:::::::::::N           A:::::AAAAAAAAA:::::A        P::::P              I::::I  
            S:::::S   A:::::::::::::::::::::A       K:::::K K:::::K        A:::::::::::::::::::::A       H:::::H     H:::::H       A:::::::::::::::::::::A     N::::::N    N::::::::::N          A:::::::::::::::::::::A       P::::P              I::::I  
            S:::::S  A:::::AAAAAAAAAAAAA:::::A    KK::::::K  K:::::KKK    A:::::AAAAAAAAAAAAA:::::A      H:::::H     H:::::H      A:::::AAAAAAAAAAAAA:::::A    N::::::N     N:::::::::N         A:::::AAAAAAAAAAAAA:::::A      P::::P              I::::I  
SSSSSSS     S:::::S A:::::A             A:::::A   K:::::::K   K::::::K   A:::::A             A:::::A   HH::::::H     H::::::HH   A:::::A             A:::::A   N::::::N      N::::::::N        A:::::A             A:::::A   PP::::::PP          II::::::II
S::::::SSSSSS:::::SA:::::A               A:::::A  K:::::::K    K:::::K  A:::::A               A:::::A  H:::::::H     H:::::::H  A:::::A               A:::::A  N::::::N       N:::::::N       A:::::A               A:::::A  P::::::::P          I::::::::I
S:::::::::::::::SSA:::::A                 A:::::A K:::::::K    K:::::K A:::::A                 A:::::A H:::::::H     H:::::::H A:::::A                 A:::::A N::::::N        N::::::N      A:::::A                 A:::::A P::::::::P          I::::::::I
 SSSSSSSSSSSSSSS AAAAAAA                   AAAAAAAKKKKKKKKK    KKKKKKKAAAAAAA                   AAAAAAAHHHHHHHHH     HHHHHHHHHAAAAAAA                   AAAAAAANNNNNNNN         NNNNNNN     AAAAAAA                   AAAAAAAPPPPPPPPPP          IIIIIIIIII
            """,
            content_type="text/plain",
        )
