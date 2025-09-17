import Image from 'next/image';
import logoImg from '/public/img/brand/Primary-Logo-White.png';
import loginImgBg from '/public/img/avatars/graduates-male-studnet.png';

function Default(props: { maincard: JSX.Element }) {
  const { maincard } = props;
  return (
      <div className="relative flex">
          <div className="mx-auto flex min-h-full w-full flex-col justify-start pt-12 md:max-w-[75%] lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:min-h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]">
              <div className="mb-auto flex flex-col pl-5 pr-5 md:pl-12 md:pr-0 lg:max-w-[48%] lg:pl-0 xl:max-w-full">
                  {maincard}
                  <div className="absolute right-0 hidden h-full min-h-screen md:block lg:w-[49vw] 2xl:w-[44vw]">
                      <div
                          className="absolute flex h-full w-full flex-col items-center justify-center gap-6 lg:rounded-bl-[120px] xl:rounded-bl-[200px]"
                          style={{ background: "var(--accent-color)" }}
                      >

                          <Image
                              src={logoImg}
                              alt="Company Logo"
                              width={400}
                              height={100}
                              className="max-w-[400px] max-h-[100px] object-contain"
                              priority
                          />

                          <h3
                              style={{
                                  fontSize: "var(--font-size-h4)",
                                  fontWeight: "var(--font-weight-normal)",
                                  color: "var(--special-text-color)",
                                  textAlign: "center",
                                  maxWidth: "400px",
                              }}
                          >
                              Trusted gateway to higher education in Malaysia
                          </h3>

                          <Image
                              src={loginImgBg}
                              alt="Company Logo"
                              width={250}
                              height={250}
                              className="max-w-[250px] max-h-[250px] object-contain"
                              priority
                          />

                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}

export default Default;
